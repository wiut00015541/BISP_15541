const applicationService = require("../services/applicationService");

const getApplications = async (req, res, next) => {
  try {
    const result = await applicationService.getApplications(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const application = await applicationService.createApplication(req.body, req.user.id);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

const updateStage = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplicationStage(
      req.params.id,
      req.body.stage,
      req.user.id,
      req.body.note
    );
    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

const scheduleInterview = async (req, res, next) => {
  try {
    const interview = await applicationService.scheduleInterview(req.params.id, req.body);
    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateStage,
  scheduleInterview,
};
