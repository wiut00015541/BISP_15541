const prisma = require("../config/prisma");

const getLookups = async () => {
  const [departments, locations, skills, roles, recruiters, hiringManagers] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: "recruiter" },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        role: true,
        department: true,
      },
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: "hiring_manager" },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        role: true,
        department: true,
      },
    }),
  ]);

  return {
    departments,
    locations,
    skills,
    roles,
    recruiters,
    hiringManagers,
  };
};

module.exports = {
  getLookups,
};
