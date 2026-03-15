const lookupService = require("../services/lookupService");

const getLookups = async (_req, res, next) => {
  try {
    const lookups = await lookupService.getLookups();
    res.status(200).json(lookups);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLookups,
};
