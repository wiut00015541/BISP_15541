# ATS System Test Cases

This document contains system-level test cases for the ATS application. The cases are written to validate the full workflow across frontend, backend, database, permissions, email, and AI resume analysis.

## Test Environment

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Database: Neon PostgreSQL
- Admin user:
  - `admin@ats.local`
  - `Admin@123`
- Recruiter user:
  - `recruiter@ats.local`
  - `Recruiter@123`
- Hiring manager user:
  - `manager@ats.local`
  - `Manager@123`

## Preconditions

- Backend is running
- Frontend is running
- Prisma schema is migrated
- Seed data is loaded
- SMTP is configured if email cases are tested
- `OPENAI_API_KEY` is configured if AI cases are tested

## Authentication And Session Tests

### TC-01 Login With Valid Admin Credentials
- Module: Authentication
- Preconditions: Admin user exists
- Steps:
  1. Open the login page
  2. Enter valid admin email and password
  3. Click `Sign in`
- Expected result:
  - User is logged in successfully
  - Dashboard page opens
  - Admin navigation items are visible

### TC-02 Login With Invalid Password
- Module: Authentication
- Preconditions: Admin user exists
- Steps:
  1. Open the login page
  2. Enter valid email and invalid password
  3. Click `Sign in`
- Expected result:
  - Login is rejected
  - Error message is shown
  - User remains on login page

### TC-03 Session Persists After Refresh
- Module: Authentication
- Preconditions: User is logged in
- Steps:
  1. Refresh the browser
- Expected result:
  - User remains logged in
  - Protected route stays accessible

### TC-04 Logout Ends Session
- Module: Authentication
- Preconditions: User is logged in
- Steps:
  1. Click `Logout`
- Expected result:
  - User is redirected to login page
  - Protected pages are no longer accessible

## Role-Based Access Control Tests

### TC-05 Admin Can See All Jobs
- Module: RBAC
- Preconditions: Jobs exist with different recruiter and hiring manager assignments
- Steps:
  1. Log in as admin
  2. Open `Jobs`
- Expected result:
  - Admin can see all jobs in the system

### TC-06 Recruiter Sees Only Assigned Jobs
- Module: RBAC
- Preconditions: At least one job is assigned to recruiter and one is not
- Steps:
  1. Log in as recruiter
  2. Open `Jobs`
- Expected result:
  - Recruiter sees only jobs assigned to them as recruiter or hiring manager

### TC-07 Hiring Manager Sees Only Assigned Jobs
- Module: RBAC
- Preconditions: At least one job is assigned to hiring manager and one is not
- Steps:
  1. Log in as hiring manager
  2. Open `Jobs`
- Expected result:
  - Hiring manager sees only jobs assigned to them

### TC-08 Non-Admin Cannot Access User Management
- Module: RBAC
- Preconditions: Recruiter account exists
- Steps:
  1. Log in as recruiter
  2. Try to open `/settings/users`
- Expected result:
  - Access is denied or redirected
  - User management is not available

## User Management Tests

### TC-09 Admin Creates Recruiter Account
- Module: User Management
- Preconditions: Admin is logged in
- Steps:
  1. Open `Settings -> Users`
  2. Fill first name, last name, email, password
  3. Select role `Recruiter`
  4. Submit the form
- Expected result:
  - User account is created
  - New recruiter appears in the users list

### TC-10 New Recruiter Appears In Job Assignment Dropdown
- Module: User Management / Jobs
- Preconditions: New recruiter account has been created
- Steps:
  1. Open `Create new job`
  2. Open the recruiter dropdown
- Expected result:
  - Newly created recruiter is available in the list

### TC-11 Admin Can Deactivate User
- Module: User Management
- Preconditions: Non-admin user exists
- Steps:
  1. Open `Settings -> Users`
  2. Click `Deactivate` for a user
- Expected result:
  - User status changes to inactive
  - User can no longer log in

## Job Management Tests

### TC-12 Create Job With Valid Data
- Module: Jobs
- Preconditions: Admin or authorized recruiter is logged in
- Steps:
  1. Open `Create new job`
  2. Fill all required fields
  3. Select department, location, recruiter, and hiring manager
  4. Submit
- Expected result:
  - Job is created successfully
  - User is redirected to job details or pipeline page

### TC-13 Job Form Validation Blocks Empty Required Fields
- Module: Jobs
- Preconditions: User is on job form
- Steps:
  1. Leave required fields empty
  2. Click `Create`
- Expected result:
  - Validation messages appear
  - Job is not created

### TC-14 Open And Close Job Status
- Module: Jobs
- Preconditions: Job exists
- Steps:
  1. Open job details page
  2. Click `Close job`
  3. Refresh page
  4. Click `Open job`
- Expected result:
  - Job status changes correctly and persists

### TC-15 Job Details Page Displays Ownership And Hiring Info
- Module: Jobs
- Preconditions: Job exists
- Steps:
  1. Open a job details page
- Expected result:
  - Title, status, department, location, openings, salary, recruiter, and hiring manager are visible

## Candidate Management Tests

### TC-16 Add Candidate Manually To Open Job
- Module: Candidates
- Preconditions: At least one open job exists
- Steps:
  1. Open `Add candidate`
  2. Fill candidate details
  3. Select an open vacancy
  4. Submit
- Expected result:
  - Candidate is created
  - Candidate is connected to the selected job
  - Application is created in `Applied` stage

### TC-17 Candidate Form Validation Blocks Invalid Email
- Module: Candidates
- Preconditions: Candidate form is open
- Steps:
  1. Enter invalid email
  2. Submit form
- Expected result:
  - Validation error appears
  - Candidate is not created

### TC-18 Uploaded Resume Is Visible In Candidate Profile
- Module: Candidates / Resume
- Preconditions: Candidate has uploaded resume
- Steps:
  1. Open candidate profile
  2. Open `Resume`
- Expected result:
  - Resume appears in resume list
  - Preview or fallback area is shown
  - Open and Download actions are available when file exists

### TC-19 Candidate Email And Phone Are Hyperlinked
- Module: Candidate Profile
- Preconditions: Candidate has email and phone
- Steps:
  1. Open candidate profile
  2. Open `Overview`
- Expected result:
  - Email uses `mailto:`
  - Phone uses `tel:`

## Pipeline Tests

### TC-20 Candidate Appears In Job Pipeline After Creation
- Module: Pipeline
- Preconditions: Candidate was manually added to a job
- Steps:
  1. Open that job pipeline page
- Expected result:
  - Candidate card is visible in `Applied`

### TC-21 Drag Candidate Between Stages
- Module: Pipeline
- Preconditions: Candidate exists in job pipeline
- Steps:
  1. Drag candidate from `Applied` to `Screening`
- Expected result:
  - Candidate moves to new stage
  - Change persists after refresh

### TC-22 Stage Counters Update After Movement
- Module: Pipeline
- Preconditions: Candidate stage move is completed
- Steps:
  1. Observe stage counts before movement
  2. Move candidate to another stage
- Expected result:
  - Source and target stage counts update correctly

## Reviews And Notes Tests

### TC-23 Add Candidate Review
- Module: Candidate Reviews
- Preconditions: Candidate exists
- Steps:
  1. Open candidate profile
  2. Open `Reviews`
  3. Enter note text
  4. Submit
- Expected result:
  - Review is saved
  - Review appears in the list with author and timestamp

## Communication And Email Tests

### TC-24 Send Candidate Email Using Template
- Module: Communication
- Preconditions: SMTP is configured and candidate email exists
- Steps:
  1. Open candidate profile
  2. Open `Communication`
  3. Select email template
  4. Verify subject and body are prefilled
  5. Send email
- Expected result:
  - Email is sent successfully
  - Communication history record is created

### TC-25 Communication History Shows Sent Status
- Module: Communication
- Preconditions: At least one candidate email has been sent
- Steps:
  1. Open candidate profile
  2. Open `Communication`
- Expected result:
  - Sent email appears in history
  - Status badge `Sent` is visible

## Interview Management Tests

### TC-26 Schedule Interview For Candidate
- Module: Interviews
- Preconditions: SMTP is configured and candidate has an application
- Steps:
  1. Open candidate profile
  2. Open `Interviews`
  3. Select application, interviewer, date, duration, meeting link
  4. Submit
- Expected result:
  - Interview is created
  - Candidate receives invitation email
  - Interview appears in interview list

### TC-27 Add Interview Feedback
- Module: Interviews
- Preconditions: Interview exists
- Steps:
  1. Open candidate profile
  2. Open `Interviews`
  3. Enter rating, strengths, concerns, recommendation
  4. Submit
- Expected result:
  - Feedback is saved
  - Feedback appears under the interview

## AI Resume Analysis Tests

### TC-28 Analyze Resume With OpenAI
- Module: AI Resume Analysis
- Preconditions: `OPENAI_API_KEY` is configured and candidate has resume
- Steps:
  1. Open candidate profile
  2. Open `Resume`
  3. Click `Analyze with AI`
- Expected result:
  - Success message appears
  - AI summary is shown
  - Extracted skills are shown
  - Experience entries are shown when available

### TC-29 AI Resume Analysis Gracefully Handles Missing OpenAI Key
- Module: AI Resume Analysis
- Preconditions: `OPENAI_API_KEY` is empty and candidate has resume
- Steps:
  1. Open candidate profile
  2. Open `Resume`
  3. Click `Analyze with AI`
- Expected result:
  - App does not crash
  - User sees a clear configuration message

## Options And Settings Tests

### TC-30 Admin Can Create New Option
- Module: Options
- Preconditions: Admin is logged in
- Steps:
  1. Open `Settings -> Options`
  2. Select an option group such as Locations
  3. Add a new item
- Expected result:
  - Option is saved
  - New item appears in the list

### TC-31 New Option Appears In Related Form
- Module: Options / Jobs / Candidates
- Preconditions: New option has been created
- Steps:
  1. Open the related form
  2. Open the corresponding dropdown
- Expected result:
  - Newly created option is selectable

## Localization Tests

### TC-32 Language Switch Updates UI
- Module: Localization
- Preconditions: App is open
- Steps:
  1. Switch language from English to Russian
  2. Navigate across pages
- Expected result:
  - UI labels update to Russian
  - Selected language remains applied

## Dashboard And Reporting Tests

### TC-33 Dashboard Shows Hiring Metrics
- Module: Dashboard
- Preconditions: Jobs, candidates, and applications exist
- Steps:
  1. Open dashboard
- Expected result:
  - Total jobs is displayed
  - Total candidates is displayed
  - Applications per stage are displayed
  - Hiring funnel analytics are displayed

### TC-34 Average Time-To-Hire Metric Appears
- Module: Dashboard Analytics
- Preconditions: At least one candidate has reached `Hired`
- Steps:
  1. Open dashboard
- Expected result:
  - Average time-to-hire metric is visible

## Notes

- These test cases are suitable for manual QA, UAT, and thesis/report documentation.
- They can also be used as the basis for future automated tests using `Vitest`, `Jest`, `Supertest`, or Playwright.
