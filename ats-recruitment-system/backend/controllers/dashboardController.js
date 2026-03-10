const analyticsService = require("../services/analyticsService");

const getOverview = async (_req, res, next) => {
  try {
    const overview = await analyticsService.getDashboardOverview();
    res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
