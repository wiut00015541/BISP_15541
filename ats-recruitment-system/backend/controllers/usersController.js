// usersController translates HTTP requests into service calls.
const userService = require("../services/userService");

// Handle the request and return users to the client.
const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.query);
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

// Handle the request and return current user to the client.
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.getCurrentUser(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Handle creation for user and send the result back.
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Handle updates for current user and return the latest state.
const updateCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.updateCurrentUser(req.user.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Refresh the stored user profile without replacing the current token.
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Handle toggle user status before the request moves into the service layer.
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id, req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Handle deletion for user at the HTTP layer.
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
