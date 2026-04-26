// departmentsController translates HTTP requests into service calls.
const departmentService = require("../services/departmentService");

// Handle the request and return departments to the client.
const getDepartments = async (_req, res, next) => {
  try {
    const departments = await departmentService.getDepartments();
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

// Handle creation for department and send the result back.
const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

// Handle updates for department and return the latest state.
const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    res.status(200).json(department);
  } catch (error) {
    next(error);
  }
};

// Handle deletion for department at the HTTP layer.
const deleteDepartment = async (req, res, next) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
