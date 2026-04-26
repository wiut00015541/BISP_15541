// reportsController translates HTTP requests into service calls.
const analyticsService = require("../services/analyticsService");

// Handle the request and return hiring funnel report to the client.
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
