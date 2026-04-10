const userService = require("../services/userService");

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.query);
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.getCurrentUser(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.updateCurrentUser(req.user.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id, req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getCurrentUser,
  createUser,
  updateCurrentUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};
