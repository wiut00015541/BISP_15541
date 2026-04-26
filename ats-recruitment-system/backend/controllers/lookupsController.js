// lookupsController translates HTTP requests into service calls.
const lookupService = require("../services/lookupService");

// Handle the request and return lookups to the client.
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
