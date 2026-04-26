// applicationsController translates HTTP requests into service calls.
const applicationService = require("../services/applicationService");

// Handle the request and return applications to the client.
const getApplications = async (req, res, next) => {
  try {
    const result = await applicationService.getApplications(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Handle creation for application and send the result back.
const createApplication = async (req, res, next) => {
  try {
    const application = await applicationService.createApplication(req.body, req.user.id, req.user);
    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// Handle updates for stage and return the latest state.
const updateStage = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplicationStage(
      req.params.id,
      req.body.stage,
      req.user.id,
      req.body.note,
      req.user
    );
    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

// Handle revert hired before the request moves into the service layer.
const revertHired = async (req, res, next) => {
  try {
    const application = await applicationService.revertHiredApplication(req.params.id, req.user.id, req.user);
    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

// Handle schedule interview before the request moves into the service layer.
const scheduleInterview = async (req, res, next) => {
  try {
    const interview = await applicationService.scheduleInterview(req.params.id, req.body, req.user);
    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
};

// Handle add interview feedback through the controller layer.
const addInterviewFeedback = async (req, res, next) => {
  try {
    const feedback = await applicationService.addInterviewFeedback(req.params.id, req.body, req.user.id, req.user);
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateStage,
  revertHired,
  scheduleInterview,
  addInterviewFeedback,
};
