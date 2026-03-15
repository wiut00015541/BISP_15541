# Neon Setup Guide

This project uses Neon PostgreSQL as the main cloud database.

## Why Neon

Neon is a good fit for this project because it is:

1. cloud-hosted
2. easy to connect with Prisma
3. free for small projects
4. simpler than managing your own PostgreSQL server

## Create The Neon Project

1. Sign in to Neon.
2. Click `Create project`.
3. Enter a project name such as `ats-recruitment-system`.
4. Choose a region close to your Render deployment region.
5. Wait for the database to finish provisioning.

## Get The Database Connection String

1. Open your Neon project.
2. Go to the project dashboard.
3. Find the connection details or connection string.
4. Copy the PostgreSQL URI.

Typical Neon format:

```env
postgresql://neondb_owner:npg_mirV0TF7BGzu@ep-frosty-shape-a1gwocww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Put it into:

- [backend/.env](/c:/Users/diana.shadiyeva/Desktop/ATS_BISP15541/ats-recruitment-system/backend/.env)

Example:

```env
DATABASE_URL="postgresql://neondb_owner:npg_mirV0TF7BGzu@ep-frosty-shape-a1gwocww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## Important Neon Notes

1. Keep `sslmode=require` in the connection string.
2. Keep `channel_binding=require` if Neon provides it in the URI.
3. Do not remove query params from the URI unless you know they are unnecessary.
4. Store the full connection string only in environment variables.

## Run Migrations

After `DATABASE_URL` is set:

```powershell
cd c:\Users\diana.shadiyeva\Desktop\ATS_BISP15541\ats-recruitment-system\backend
npx prisma generate
npx prisma migrate dev --name init
```

## Seed Initial Data

```powershell
node prisma/seed.js
```

This creates:

1. default roles
2. permissions
3. pipeline stages
4. an admin user
5. a default department

## Inspect The Database

You can use Prisma Studio:

```powershell
npx prisma studio
```

You can also inspect the database from the Neon dashboard.

## Common Neon Issues

### Prisma Cannot Connect

Usually caused by:

1. wrong password
2. incomplete connection string
3. missing `sslmode=require`
4. accidentally editing the provided Neon URI

### Migration Fails

Usually caused by:

1. the wrong database URL
2. using a branch or database that does not exist
3. a schema that was manually changed outside Prisma

## Recommended Neon Practices

1. Keep separate Neon projects or branches for development and production.
2. Use the exact connection string Neon provides.
3. Rotate credentials if they are exposed.
4. Do not hardcode Neon credentials in source files.
