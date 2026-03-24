const analyticsService = require("../services/analyticsService");

const getHiringFunnelReport = async (req, res, next) => {
  try {
    const report = await analyticsService.buildFunnelReport(req.user);
    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHiringFunnelReport,
};
