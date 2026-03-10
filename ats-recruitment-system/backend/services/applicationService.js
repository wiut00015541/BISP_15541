const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

const buildApplicationWhere = (query) => {
  const where = {};

  if (query.stage) {
    where.currentStage = {
      name: { equals: query.stage, mode: "insensitive" },
    };
  }

  if (query.jobId) {
    where.jobId = query.jobId;
  }

  if (query.candidateId) {
    where.candidateId = query.candidateId;
  }

  return where;
};

const getApplications = async (query) => {
  const where = buildApplicationWhere(query);
  const { page, limit, skip } = parsePagination(query);
  const sortMap = { created_at: "appliedAt", updated_at: "updatedAt" };
  const normalizedQuery = { ...query, sort: sortMap[query.sort] || query.sort };
  const orderBy = parseSort(normalizedQuery, ["appliedAt", "updatedAt", "score"], "appliedAt");

  const [data, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        candidate: true,
        job: true,
        currentStage: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const createApplication = async (payload, userId) => {
  // Every new application starts from the first pipeline stage.
  const stage = await prisma.stage.findFirst({ where: { name: "Applied" } });
  if (!stage) {
    const error = new Error("Pipeline stage not configured");
    error.status = 500;
    throw error;
  }

  const application = await prisma.application.create({
    data: {
      candidateId: payload.candidateId,
      jobId: payload.jobId,
      currentStageId: stage.id,
      source: payload.source,
      score: payload.score,
    },
  });

  await prisma.applicationHistory.create({
    data: {
      applicationId: application.id,
      toStageId: stage.id,
      changedById: userId,
      note: "Application created",
    },
  });

  return application;
};

const updateApplicationStage = async (applicationId, stageName, changedById, note) => {
  const [application, nextStage] = await Promise.all([
    prisma.application.findUnique({ where: { id: applicationId } }),
    prisma.stage.findFirst({
      where: { name: { equals: stageName, mode: "insensitive" } },
    }),
  ]);

  if (!application || !nextStage) {
    const error = new Error("Application or stage not found");
    error.status = 404;
    throw error;
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { currentStageId: nextStage.id },
    include: { currentStage: true },
  });

  await prisma.applicationHistory.create({
    // Store full transition history for audit/reporting.
    data: {
      applicationId,
      fromStageId: application.currentStageId,
      toStageId: nextStage.id,
      changedById,
      note,
    },
  });

  return updated;
};

const scheduleInterview = (applicationId, payload) => {
  return prisma.interview.create({
    data: {
      applicationId,
      stageId: payload.stageId,
      interviewerId: payload.interviewerId,
      scheduledAt: new Date(payload.scheduledAt),
      durationMinutes: payload.durationMinutes || 60,
      meetingLink: payload.meetingLink,
    },
  });
};

module.exports = {
  getApplications,
  createApplication,
  updateApplicationStage,
  scheduleInterview,
};
