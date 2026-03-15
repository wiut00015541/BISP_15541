# ATS Setup Guide

This guide covers everything you need to install, register, configure, and run the ATS locally.

## What To Register

Create these accounts before starting:

1. `Neon`
   Use this for the PostgreSQL production-style cloud database.
2. `OpenAI`
   Required for the resume analysis feature.
3. `Render`
   Used for backend deployment.
4. `Vercel`
   Used for frontend deployment.
5. `GitHub`
   Recommended for version control and deployment integrations.

## What To Install

Install these tools on your machine:

1. `Node.js` LTS
   Recommended: `20.x` or newer LTS.
2. `npm`
   Comes with Node.js.
3. `Git`
4. Optional: `Postman` or `Insomnia` for testing APIs.
5. Optional: `VS Code` with Prisma, Tailwind CSS, and ESLint extensions.

Check your versions:

```powershell
node -v
npm -v
git --version
```

## Required Libraries

Backend dependencies:

- `express`
- `dotenv`
- `cors`
- `morgan`
- `jsonwebtoken`
- `bcryptjs`
- `@prisma/client`
- `prisma`
- `openai`
- `nodemon`

Frontend dependencies:

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `postcss`
- `autoprefixer`

These are already declared in:

- [backend/package.json](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/backend/package.json)
- [frontend/package.json](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/frontend/package.json)

## Environment Files

Backend example:

- [backend/.env](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/backend/.env)

Frontend example:

- [frontend/.env](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/frontend/.env)

Create these files:

1. `backend/.env`
2. `frontend/.env`

Backend `.env` template:

```env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:npg_mirV0TF7BGzu@ep-frosty-shape-a1gwocww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="replace_with_a_long_random_secret"
JWT_EXPIRES_IN="1d"
OPENAI_API_KEY="your_openai_api_key"
FRONTEND_URL="http://localhost:5173"
```

Frontend `.env` template:

```env
VITE_API_URL="http://localhost:5000/api"
```

## Local Installation

Install backend dependencies:

```powershell
cd c:\Users\diana.shadiyeva\Desktop\ATS_BISP15541\ats-recruitment-system\backend
npm install
```

Install frontend dependencies:

```powershell
cd c:\Users\diana.shadiyeva\Desktop\ATS_BISP15541\ats-recruitment-system\frontend
npm install
```

## Prisma And Database Initialization

After `DATABASE_URL` is set correctly, run:

```powershell
cd c:\Users\diana.shadiyeva\Desktop\ATS_BISP15541\ats-recruitment-system\backend
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
```

What each command does:

1. `npx prisma generate`
   Generates the Prisma client used by the backend.
2. `npx prisma migrate dev --name init`
   Creates database tables from [schema.prisma](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/backend/prisma/schema.prisma).
3. `node prisma/seed.js`
   Inserts default roles, permissions, stages, and the first admin user.

## Default Admin Login

After the seed completes, use:

```text
Email: admin@ats.local
Password: Admin@123
```

## Run The Project Locally

Start backend:

```powershell
cd c:\Users\diana.shadiyeva\Desktop\ATS_BISP15541\ats-recruitment-system\backend
npm run dev
```

Start frontend in another terminal:

```powershell
cd c:\Users\diana.shadiyeva\Desktop\ATS_BISP15541\ats-recruitment-system\frontend
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health endpoint: `http://localhost:5000/health`

## What Must Work For The App To Function

Make sure all of these are true:

1. `DATABASE_URL` points to a real PostgreSQL database.
2. Prisma migration ran successfully.
3. `JWT_SECRET` is set.
4. `VITE_API_URL` points to the backend API.
5. `FRONTEND_URL` matches the frontend origin.
6. `OPENAI_API_KEY` is set if you want AI resume analysis.

## Common Problems

### Prisma Cannot Connect

Usually caused by a bad `DATABASE_URL`, an incorrect password, or a malformed Neon connection string.

### CORS Errors

Usually caused by `FRONTEND_URL` not matching the real frontend URL.

### Login Fails

Usually caused by not running the seed script or using a different database than expected.

### No Data In Frontend

Usually caused by:

- backend not running
- wrong `VITE_API_URL`
- missing JWT after login

### OpenAI Resume Analysis Does Not Work

Usually caused by a missing or invalid `OPENAI_API_KEY`.
