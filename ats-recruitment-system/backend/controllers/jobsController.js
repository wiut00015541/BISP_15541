const jobService = require("../services/jobService");

const getJobs = async (req, res, next) => {
  try {
    const result = await jobService.getJobs(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body, req.user.id);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
};
