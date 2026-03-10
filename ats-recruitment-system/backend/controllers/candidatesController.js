const candidateService = require("../services/candidateService");

const getCandidates = async (req, res, next) => {
  try {
    const result = await candidateService.getCandidates(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.createCandidate(req.body);
    res.status(201).json(candidate);
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
      req.body.isPrivate
    );
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  createCandidate,
  addCandidateNote,
};
