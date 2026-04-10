const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const buildSeedDatabaseUrl = () => {
  const baseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error("DIRECT_URL or DATABASE_URL must be set before running seed");
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}connection_limit=1&pool_timeout=60`;
};

const prisma = new PrismaClient({
  log: ["warn", "error"],
  datasources: {
    db: {
      url: buildSeedDatabaseUrl(),
    },
  },
});

const permissions = [
  { key: "users.read", label: "View Users" },
  { key: "users.write", label: "Manage Users" },
  { key: "jobs.read", label: "View Jobs" },
  { key: "jobs.write", label: "Manage Jobs" },
  { key: "candidates.read", label: "View Candidates" },
  { key: "candidates.write", label: "Manage Candidates" },
  { key: "applications.read", label: "View Applications" },
  { key: "applications.write", label: "Manage Applications" },
  { key: "reports.read", label: "View Reports" },
  { key: "settings.write", label: "Manage Settings" },
];

const stages = [
  { name: "Applied", order: 1, isTerminal: false },
  { name: "Screening", order: 2, isTerminal: false },
  { name: "Interview", order: 3, isTerminal: false },
  { name: "Offer", order: 4, isTerminal: false },
  { name: "Hired", order: 5, isTerminal: true },
  { name: "Rejected", order: 6, isTerminal: true },
];

const departments = ["Engineering", "Product", "Design", "People Operations"];
const locations = [
  { name: "Remote", isRemote: true, country: "Global" },
  { name: "Tashkent City", isRemote: false, country: "Uzbekistan" },
  { name: "Republic of Karakalpakstan", isRemote: false, country: "Uzbekistan" },
  { name: "Andijan Region", isRemote: false, country: "Uzbekistan" },
  { name: "Bukhara Region", isRemote: false, country: "Uzbekistan" },
  { name: "Fergana Region", isRemote: false, country: "Uzbekistan" },
  { name: "Jizzakh Region", isRemote: false, country: "Uzbekistan" },
  { name: "Namangan Region", isRemote: false, country: "Uzbekistan" },
  { name: "Navoiy Region", isRemote: false, country: "Uzbekistan" },
  { name: "Kashkadarya Region", isRemote: false, country: "Uzbekistan" },
  { name: "Samarkand Region", isRemote: false, country: "Uzbekistan" },
  { name: "Sirdarya Region", isRemote: false, country: "Uzbekistan" },
  { name: "Surkhandarya Region", isRemote: false, country: "Uzbekistan" },
  { name: "Tashkent Region", isRemote: false, country: "Uzbekistan" },
  { name: "Khorezm Region", isRemote: false, country: "Uzbekistan" },
  { name: "Nukus", isRemote: false, country: "Uzbekistan" },
  { name: "Samarkand", isRemote: false, country: "Uzbekistan" },
  { name: "Bukhara", isRemote: false, country: "Uzbekistan" },
  { name: "Andijan", isRemote: false, country: "Uzbekistan" },
  { name: "Namangan", isRemote: false, country: "Uzbekistan" },
  { name: "Fergana", isRemote: false, country: "Uzbekistan" },
  { name: "Qarshi", isRemote: false, country: "Uzbekistan" },
  { name: "Navoiy", isRemote: false, country: "Uzbekistan" },
  { name: "Jizzakh", isRemote: false, country: "Uzbekistan" },
  { name: "Gulistan", isRemote: false, country: "Uzbekistan" },
  { name: "Termez", isRemote: false, country: "Uzbekistan" },
  { name: "Urgench", isRemote: false, country: "Uzbekistan" },
  { name: "Kokand", isRemote: false, country: "Uzbekistan" },
  { name: "Margilan", isRemote: false, country: "Uzbekistan" },
  { name: "Angren", isRemote: false, country: "Uzbekistan" },
  { name: "Chirchiq", isRemote: false, country: "Uzbekistan" },
];
const skills = [
  "React",
  "Node.js",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "Figma",
  "Recruiting",
  "Sourcing",
];
const candidateSources = [
  { id: "manual", code: "MANUAL", name: "Manual entry" },
  { id: "linkedin", code: "LINKEDIN", name: "LinkedIn" },
  { id: "referral", code: "REFERRAL", name: "Employee referral" },
  { id: "career_site", code: "CAREER_SITE", name: "Career site" },
  { id: "telegram", code: "TELEGRAM", name: "Telegram" },
];
const jobTypes = [
  { id: "full_time", code: "FULL_TIME", name: "Full time" },
  { id: "part_time", code: "PART_TIME", name: "Part time" },
  { id: "contract", code: "CONTRACT", name: "Contract" },
  { id: "internship", code: "INTERNSHIP", name: "Internship" },
];
const jobStatuses = [
  { id: "draft", code: "DRAFT", name: "Draft" },
  { id: "open", code: "OPEN", name: "Open" },
  { id: "closed", code: "CLOSED", name: "Closed" },
  { id: "on_hold", code: "ON_HOLD", name: "On hold" },
];
const interviewStatuses = [
  { id: "scheduled", code: "SCHEDULED", name: "Scheduled" },
  { id: "completed", code: "COMPLETED", name: "Completed" },
  { id: "canceled", code: "CANCELED", name: "Canceled" },
  { id: "no_show", code: "NO_SHOW", name: "No show" },
];
const emailTemplates = [
  {
    id: "candidate_outreach",
    code: "candidate_outreach",
    name: "Candidate outreach",
    subject: "Update regarding your application",
    heading: "Application update",
    intro: "Hello {{candidateFirstName}}, we wanted to share an update regarding your application.",
    closing: "{{senderName}}",
  },
  {
    id: "interview_invitation",
    code: "interview_invitation",
    name: "Interview invitation",
    subject: "Interview scheduled for {{jobTitle}}",
    heading: "Interview scheduled for {{jobTitle}}",
    intro:
      "Hello {{candidateFirstName}}, your interview for {{jobTitle}} has been scheduled for {{formattedDate}}.",
    closing: "ATS Recruitment Team",
  },
];

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "System administrator" },
  });

  const recruiterRole = await prisma.role.upsert({
    where: { name: "recruiter" },
    update: {},
    create: { name: "recruiter", description: "Recruitment specialist" },
  });

  const hiringManagerRole = await prisma.role.upsert({
    where: { name: "hiring_manager" },
    update: {},
    create: { name: "hiring_manager", description: "Hiring manager" },
  });

  const permissionRows = [];
  for (const permission of permissions) {
    const row = await prisma.permission.upsert({
      where: { key: permission.key },
      update: {},
      create: permission,
    });
    permissionRows.push(row);
  }

  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { name: stage.name },
      update: { order: stage.order, isTerminal: stage.isTerminal },
      create: stage,
    });
  }

  for (const permission of permissionRows) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const recruiterPermissions = permissionRows.filter((p) =>
    ["jobs.read", "jobs.write", "candidates.read", "candidates.write", "applications.read", "applications.write", "reports.read"].includes(p.key)
  );

  for (const permission of recruiterPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: recruiterRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: recruiterRole.id,
        permissionId: permission.id,
      },
    });
  }

  const managerPermissions = permissionRows.filter((p) =>
    ["jobs.read", "candidates.read", "applications.read", "reports.read"].includes(p.key)
  );

  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: hiringManagerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: hiringManagerRole.id,
        permissionId: permission.id,
      },
    });
  }

  const departmentRows = [];
  for (const departmentName of departments) {
    const department = await prisma.department.upsert({
      where: { name: departmentName },
      update: {},
      create: { name: departmentName },
    });
    departmentRows.push(department);
  }

  for (const location of locations) {
    await prisma.location.upsert({
      where: { name: location.name },
      update: {
        country: location.country,
        isRemote: location.isRemote,
      },
      create: location,
    });
  }

  for (const skillName of skills) {
    await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });
  }

  await prisma.systemSetting.upsert({
    where: { key: "candidate_sources" },
    update: {},
    create: { key: "candidate_sources", value: JSON.stringify(candidateSources) },
  });

  await prisma.systemSetting.upsert({
    where: { key: "job_types" },
    update: {},
    create: { key: "job_types", value: JSON.stringify(jobTypes) },
  });

  await prisma.systemSetting.upsert({
    where: { key: "job_statuses" },
    update: {},
    create: { key: "job_statuses", value: JSON.stringify(jobStatuses) },
  });

  await prisma.systemSetting.upsert({
    where: { key: "interview_statuses" },
    update: {},
    create: { key: "interview_statuses", value: JSON.stringify(interviewStatuses) },
  });

  await prisma.systemSetting.upsert({
    where: { key: "email_templates" },
    update: {},
    create: { key: "email_templates", value: JSON.stringify(emailTemplates) },
  });

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const recruiterPasswordHash = await bcrypt.hash("Recruiter@123", 10);
  const managerPasswordHash = await bcrypt.hash("Manager@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@ats.local" },
    update: {},
    create: {
      firstName: "System",
      lastName: "Admin",
      email: "admin@ats.local",
      passwordHash,
      roleId: adminRole.id,
      departmentId: departmentRows[0].id,
    },
  });

  await prisma.user.upsert({
    where: { email: "recruiter@ats.local" },
    update: {},
    create: {
      firstName: "Recruiter",
      lastName: "One",
      email: "recruiter@ats.local",
      passwordHash: recruiterPasswordHash,
      roleId: recruiterRole.id,
      departmentId: departmentRows[0].id,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@ats.local" },
    update: {},
    create: {
      firstName: "Hiring",
      lastName: "Manager",
      email: "manager@ats.local",
      passwordHash: managerPasswordHash,
      roleId: hiringManagerRole.id,
      departmentId: departmentRows[0].id,
    },
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
