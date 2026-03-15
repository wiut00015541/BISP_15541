const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const permissions = [
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
  { name: "Singapore", isRemote: false, country: "Singapore" },
  { name: "Tashkent", isRemote: false, country: "Uzbekistan" },
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
