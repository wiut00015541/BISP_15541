const prisma = require("../config/prisma");

const getLookups = async () => {
  const [departments, locations, skills] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    departments,
    locations,
    skills,
  };
};

module.exports = {
  getLookups,
};
