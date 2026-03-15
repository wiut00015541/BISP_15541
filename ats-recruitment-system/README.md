# ATS Recruitment System

Production-oriented Applicant Tracking System inspired by SmartRecruiters.

## Stack

- Backend: Node.js, Express, Prisma ORM, PostgreSQL (Neon)
- Frontend: React, Vite, TailwindCSS
- Deployment: Render (backend), Vercel (frontend)

## Full Setup Guides

- General installation and local development: [docs/SETUP.md](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/docs/SETUP.md)
- Neon database configuration: [docs/NEON.md](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/docs/NEON.md)
- Production deployment on Render and Vercel: [docs/DEPLOYMENT.md](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/docs/DEPLOYMENT.md)

## Project Structure

```text
ats-recruitment-system
|-- backend
|   |-- controllers
|   |-- routes
|   |-- services
|   |-- middleware
|   |-- prisma
|   |-- utils
|   |-- config
|   `-- server.js
|-- frontend
|   `-- src
|       |-- pages
|       |-- components
|       |-- services
|       |-- hooks
|       `-- App.jsx
`-- README.md
```

## Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

Frontend environment file: [frontend/.env](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/frontend/.env)

## Required ATS Features Implemented

- JWT authentication (`POST /auth/register`, `POST /auth/login`)
- Role-based access control via role-permission matrix
- Job CRUD with filtering/sorting/pagination
- Candidate CRUD (create/list) with filtering/sorting/pagination
- Candidate notes API
- Application pipeline with stage transitions
- Interview scheduling API
- Dashboard analytics
- Hiring funnel reports
- AI resume analysis with OpenAI API (`POST /ai/resume-analysis`)

## Pipeline Stages

Seeded pipeline:

- Applied
- Screening
- Interview
- Offer
- Hired
- Rejected

## API Examples

- `GET /api/jobs?department=engineering&location=remote`
- `GET /api/candidates?skill=react&page=1&limit=20`
- `GET /api/applications?stage=interview`
- `GET /api/jobs?sort=created_at&order=desc`
- `PATCH /api/applications/:id/stage` with `{ "stage": "Interview" }`

## Prisma Schema

The Prisma schema includes 23 models (20+ required), including all requested tables:

- users
- roles
- permissions
- role_permissions
- jobs
- departments
- locations
- skills
- job_skills
- candidates
- candidate_skills
- resumes
- candidate_notes
- applications
- stages
- application_history
- interviews
- interview_feedback
- notifications
- messages
- reports
- system_settings
- audit_logs (extra)

## Deployment Notes

### Render (Backend)

- Root directory: `backend`
- Build command: `npm install && npx prisma generate`
- Start command: `npm start`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OPENAI_API_KEY`, `FRONTEND_URL`

### Vercel (Frontend)

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` pointing to Render backend URL
