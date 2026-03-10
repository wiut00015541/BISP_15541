const prisma = require("../config/prisma");

const getDashboardOverview = async () => {
  const [totalJobs, totalCandidates, stageAggregation] = await Promise.all([
    prisma.job.count(),
    prisma.candidate.count(),
    prisma.application.groupBy({
      by: ["currentStageId"],
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

const buildFunnelReport = async () => {
  const stages = await prisma.stage.findMany({
    orderBy: { order: "asc" },
    include: {
      applications: true,
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
