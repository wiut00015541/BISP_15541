// jobsController translates HTTP requests into service calls.
const jobService = require("../services/jobService");

// Handle the request and return jobs to the client.
const getJobs = async (req, res, next) => {
  try {
    const result = await jobService.getJobs(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Handle the request and return job by id to the client.
const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id, req.user);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

// Handle creation for job and send the result back.
const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body, req.user.id);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// Handle updates for job and return the latest state.
const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body, req.user);
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

// Handle deletion for job at the HTTP layer.
const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
