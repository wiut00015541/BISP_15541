const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

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

async function main() {
  const [adminRole, recruiterRole, hiringManagerRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin", description: "System administrator" },
    }),
    prisma.role.upsert({
      where: { name: "recruiter" },
      update: {},
      create: { name: "recruiter", description: "Recruitment specialist" },
    }),
    prisma.role.upsert({
      where: { name: "hiring_manager" },
      update: {},
      create: { name: "hiring_manager", description: "Hiring manager" },
    }),
  ]);

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
