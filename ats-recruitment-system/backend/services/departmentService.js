const prisma = require("../config/prisma");

const getDepartments = () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
  });
};

const createDepartment = async (payload) => {
  if (!payload.name?.trim()) {
    const error = new Error("Department name is required");
    error.status = 400;
    throw error;
  }

  return prisma.department.create({
    data: {
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    },
  });
};

const updateDepartment = async (id, payload) => {
  if (!payload.name?.trim()) {
    const error = new Error("Department name is required");
    error.status = 400;
    throw error;
  }

  return prisma.department.update({
    where: { id },
    data: {
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    },
  });
};

const deleteDepartment = (id) => {
  return prisma.department.delete({
    where: { id },
  });
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
