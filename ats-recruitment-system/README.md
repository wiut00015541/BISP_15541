# ATS Recruitment System

## Requirements

- Node.js 20+
- npm
- PostgreSQL or Neon PostgreSQL

## 1. Clone The Project


git clone https://github.com/wiut00015541/BISP_15541.git
cd BISP_15541\ats-recruitment-system


## 2. Create Backend Environment File

Create `backend/.env`:

PORT=5000
DATABASE_URL="postgresql://neondb_owner:npg_mirV0TF7BGzu@ep-frosty-shape-a1gwocww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=15"
DIRECT_URL="postgresql://neondb_owner:npg_mirV0TF7BGzu@ep-frosty-shape-a1gwocww.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=15"
JWT_SECRET="18a6a903-9874-4630-98c9-f67c83d35a432d9596be-1023-4321-8147-3e7a27e4789d"
JWT_EXPIRES_IN="1d"
OPENAI_RESUME_MODEL="gpt-4.1-mini"
FRONTEND_URL="http://localhost:5173"
SMTP_SERVICE="gmail"
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER="shadiyevadiana@gmail.com"
SMTP_PASS="gqenlvnmhblngqdb"
SMTP_SECURE="false"
EMAIL_FROM="shadiyevadiana@gmail.com"



## 3. Install And Run Backend

cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev


Backend:


http://localhost:5000


Health check:

http://localhost:5000/health


## 4. Create Frontend Environment File

Open a second terminal in the project root and create `frontend/.env`:


VITE_API_URL=http://localhost:5000/api


## 5. Install And Run Frontend


cd frontend
npm install
npm run dev


Frontend:


http://localhost:5173


## 6. Login


Admin
Email: admin@ats.local
Password: Admin@123


## Useful Commands

Backend:

cd backend
npm run dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm test


Frontend:


cd frontend
npm run dev
npm run build

