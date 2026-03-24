const prisma = require("../config/prisma");
const { isAdmin } = require("../utils/accessScope");

const buildJobScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
  };
};

const buildApplicationScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    job: {
      OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
    },
  };
};

const buildCandidateScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    applications: {
      some: {
        job: {
          OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
        },
      },
    },
  };
};

const getDashboardOverview = async (user) => {
  const [totalJobs, totalCandidates, stageAggregation] = await Promise.all([
    prisma.job.count({ where: buildJobScope(user) }),
    prisma.candidate.count({ where: buildCandidateScope(user) }),
    prisma.application.groupBy({
      by: ["currentStageId"],
      where: buildApplicationScope(user),
      _count: { _all: true },
    }),
  ]);

  const stages = await prisma.stage.findMany({ orderBy: { order: "asc" } });
  const stageCountMap = new Map(stageAggregation.map((row) => [row.currentStageId, row._count._all]));

  const applicationsPerStage = stages.map((stage) => ({
    stage: stage.name,
    count: stageCountMap.get(stage.id) || 0,
  }));

  const funnelStages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];
  const hiringFunnel = applicationsPerStage.filter((item) => funnelStages.includes(item.stage));

  return {
    totalJobs,
    totalCandidates,
    applicationsPerStage,
    hiringFunnel,
  };
};

const buildFunnelReport = async (user) => {
  const stages = await prisma.stage.findMany({
    orderBy: { order: "asc" },
    include: {
      applications: {
        where: buildApplicationScope(user),
      },
    },
  });

  return stages.map((stage) => ({
    stage: stage.name,
    count: stage.applications.length,
  }));
};

module.exports = {
  getDashboardOverview,
  buildFunnelReport,
};
