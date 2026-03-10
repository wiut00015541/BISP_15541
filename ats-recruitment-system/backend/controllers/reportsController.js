const analyticsService = require("../services/analyticsService");

const getHiringFunnelReport = async (_req, res, next) => {
  try {
    const report = await analyticsService.buildFunnelReport();
    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHiringFunnelReport,
};
