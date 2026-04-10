const candidateService = require("../services/candidateService");

const getCandidates = async (req, res, next) => {
  try {
    const result = await candidateService.getCandidates(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

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

const analyzeResume = async (req, res, next) => {
  try {
    const result = await candidateService.analyzeCandidateResume(req.params.id, req.params.resumeId, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.createCandidate(req.body, req.file, req.user.id, req.user);
    res.status(201).json(candidate);
  } catch (error) {
    next(error);
  }
};

const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.updateCandidate(req.params.id, req.body, req.file, req.user.id, req.user);
    res.status(200).json(candidate);
  } catch (error) {
    next(error);
  }
};

const deleteCandidate = async (req, res, next) => {
  try {
    await candidateService.deleteCandidate(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

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
