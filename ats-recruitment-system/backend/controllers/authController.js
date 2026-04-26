// authController translates HTTP requests into service calls.
const authService = require("../services/authService");

// Handle register before the request moves into the service layer.
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Handle the login flow for this part of the app.
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
