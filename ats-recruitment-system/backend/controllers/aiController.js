const aiService = require("../services/aiService");
const prisma = require("../config/prisma");

const analyzeResume = async (req, res, next) => {
  try {
    const analysis = await aiService.analyzeResume({ resumeText: req.body.resumeText });

    if (req.body.candidateId) {
      await prisma.resume.create({
        data: {
          candidateId: req.body.candidateId,
          uploadedById: req.user.id,
          rawText: req.body.resumeText,
          aiSummary: analysis.summary,
          aiSkills: analysis.skills,
          aiExperience: analysis.experience,
          parsedAt: new Date(),
        },
      });
    }

    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
};
