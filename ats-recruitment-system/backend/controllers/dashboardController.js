// dashboardController translates HTTP requests into service calls.
const analyticsService = require("../services/analyticsService");

// Handle the request and return overview to the client.
const getOverview = async (req, res, next) => {
  try {
    const overview = await analyticsService.getDashboardOverview(req.user);
    res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
