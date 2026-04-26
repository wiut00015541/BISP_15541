// departmentService contains backend business logic for this area.
const prisma = require("../config/prisma");

// Load departments with the business rules for this area.
const getDepartments = () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
  });
};

// Create department and apply the related business rules.
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

// Update department while keeping the workflow rules consistent.
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

// Delete department after the access checks pass.
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
