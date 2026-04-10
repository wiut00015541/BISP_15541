-- Convert enum-backed fields to text so admin-managed options are not constrained
ALTER TABLE "jobs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "interviews" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "jobs"
  ALTER COLUMN "type" TYPE TEXT USING "type"::text,
  ALTER COLUMN "status" TYPE TEXT USING "status"::text;

ALTER TABLE "interviews"
  ALTER COLUMN "status" TYPE TEXT USING "status"::text;

ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "interviews" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

DROP TYPE IF EXISTS "JobType";
DROP TYPE IF EXISTS "JobStatus";
DROP TYPE IF EXISTS "InterviewStatus";
