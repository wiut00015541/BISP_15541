# Deployment Guide

This project is designed for:

- Backend on Render
- Frontend on Vercel
- Database on Neon

## Before Deployment

Make sure you have:

1. pushed the repository to GitHub
2. created a Neon project
3. verified the app works locally
4. set your production environment variables

## Deploy Backend To Render

### Create The Service

1. Sign in to Render.
2. Click `New +`.
3. Choose `Web Service`.
4. Connect your GitHub repository.
5. Select the repository containing this project.

### Render Settings

Use these values:

- Root Directory: `ats-recruitment-system/backend`
- Environment: `Node`
- Build Command: `npm install && npm run prisma:generate`
- Start Command: `npm start`

### Backend Environment Variables

Add these in Render:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_mirV0TF7BGzu@ep-frosty-shape-a1gwocww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Important Notes For Render

1. `DATABASE_URL` must point to your Neon production database.
2. `FRONTEND_URL` must match your Vercel frontend URL.
3. If you run migrations manually, do that before production traffic.
4. If you want automated migrations on deploy, add a safe migration workflow later. Right now this project does not run migrations automatically in the start command.

## Deploy Frontend To Vercel

### Create The Project

1. Sign in to Vercel.
2. Click `Add New`.
3. Choose `Project`.
4. Import the GitHub repository.

### Vercel Settings

Use these values:

- Root Directory: `ats-recruitment-system/frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Frontend Environment Variables

Add this in Vercel:

```env
VITE_API_URL=https://your-render-backend-domain.onrender.com/api
```

## Production URL Wiring

When both apps are deployed:

1. Copy the Vercel frontend URL into Render `FRONTEND_URL`.
2. Copy the Render backend URL plus `/api` into Vercel `VITE_API_URL`.
3. Redeploy both if you changed environment variables.

## Production Database

Use Neon production connection values for:

- Render `DATABASE_URL`

Do not hardcode database credentials in source files.

## Production Checklist

Before going live, verify:

1. login works
2. `/health` returns status `ok`
3. job list loads from frontend
4. candidate list loads from frontend
5. application pipeline loads
6. language switching works
7. AI resume analysis works if `OPENAI_API_KEY` is configured

## Recommended Next Hardening Steps

1. Add validation middleware for all request payloads
2. Add rate limiting on auth routes
3. Add refresh tokens or secure session handling
4. Add logging and error monitoring
5. Add CI/CD checks before deploy
