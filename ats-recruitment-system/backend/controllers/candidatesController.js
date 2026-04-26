// candidatesController translates HTTP requests into service calls.
const candidateService = require("../services/candidateService");

// Handle the request and return candidates to the client.
const getCandidates = async (req, res, next) => {
  try {
    const result = await candidateService.getCandidates(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Handle the request and return candidate by id to the client.
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id, req.user);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    return res.status(200).json(candidate);
  } catch (error) {
    return next(error);
  }
};

// Handle analyze resume before the request moves into the service layer.
const analyzeResume = async (req, res, next) => {
  try {
    const result = await candidateService.analyzeCandidateResume(req.params.id, req.params.resumeId, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Handle creation for candidate and send the result back.
const createCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.createCandidate(req.body, req.file, req.user.id, req.user);
    res.status(201).json(candidate);
  } catch (error) {
    next(error);
  }
};

// Handle updates for candidate and return the latest state.
const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.updateCandidate(req.params.id, req.body, req.file, req.user.id, req.user);
    res.status(200).json(candidate);
  } catch (error) {
    next(error);
  }
};

// Handle deletion for candidate at the HTTP layer.
const deleteCandidate = async (req, res, next) => {
  try {
    await candidateService.deleteCandidate(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Handle add candidate note through the controller layer.
const addCandidateNote = async (req, res, next) => {
  try {
    const note = await candidateService.addCandidateNote(
      req.params.id,
      req.user.id,
      req.body.content,
      req.body.isPrivate,
      req.user
    );
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// Handle send communication before the request moves into the service layer.
const sendCommunication = async (req, res, next) => {
  try {
    const communication = await candidateService.sendCandidateCommunication(req.params.id, req.body, req.user, req.user);
    res.status(201).json(communication);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  analyzeResume,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  addCandidateNote,
  sendCommunication,
};
