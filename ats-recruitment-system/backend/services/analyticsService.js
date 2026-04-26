// analyticsService contains backend business logic for this area.
const prisma = require("../config/prisma");
const { isAdmin } = require("../utils/accessScope");

// Keep build job scope inside the service layer instead of the controller.
const buildJobScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
  };
};

// Keep build application scope inside the service layer instead of the controller.
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

// Keep build candidate scope inside the service layer instead of the controller.
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

// Load dashboard overview with the business rules for this area.
const getDashboardOverview = async (user) => {
  const [totalJobs, totalCandidates, stageAggregation, jobStatusAggregation] = await Promise.all([
    prisma.job.count({ where: buildJobScope(user) }),
    prisma.candidate.count({ where: buildCandidateScope(user) }),
    prisma.application.groupBy({
      by: ["currentStageId"],
      where: buildApplicationScope(user),
      _count: { _all: true },
    }),
    prisma.job.groupBy({
      by: ["status"],
      where: buildJobScope(user),
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
  const jobStatusCountMap = new Map(jobStatusAggregation.map((row) => [row.status || "UNKNOWN", row._count._all]));
  const knownJobStatuses = ["DRAFT", "OPEN", "CLOSED"];
  const combinedStatuses = Array.from(new Set([...knownJobStatuses, ...jobStatusCountMap.keys()]));
  const jobsPerStatus = combinedStatuses.map((status) => ({
    status,
    count: jobStatusCountMap.get(status) || 0,
  }));

  const hiredStage = stages.find((stage) => stage.name === "Hired");
  let averageTimeToHireDays = null;
  let hiredCandidates = 0;

  if (hiredStage) {
    const hiredApplications = await prisma.application.findMany({
      where: {
        ...buildApplicationScope(user),
        currentStageId: hiredStage.id,
      },
      select: {
        appliedAt: true,
        history: {
          where: {
            toStageId: hiredStage.id,
          },
          orderBy: {
            changedAt: "asc",
          },
          select: {
            changedAt: true,
          },
        },
      },
    });

    const durations = hiredApplications
      .map((application) => {
        const hiredAt = application.history[0]?.changedAt;
        if (!hiredAt) {
          return null;
        }

        return (new Date(hiredAt).getTime() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24);
      })
      .filter((value) => typeof value === "number" && Number.isFinite(value));

    hiredCandidates = durations.length;
    averageTimeToHireDays = durations.length
      ? Number((durations.reduce((sum, current) => sum + current, 0) / durations.length).toFixed(1))
      : null;
  }

  return {
    totalJobs,
    totalCandidates,
    applicationsPerStage,
    jobsPerStatus,
    hiringFunnel,
    metrics: {
      openPositions: totalJobs,
      activePipelineCandidates: applicationsPerStage.reduce((sum, item) => sum + item.count, 0),
      hiredCandidates,
      averageTimeToHireDays,
    },
    live: {
      refreshedAt: new Date().toISOString(),
    },
  };
};

// Keep build funnel report inside the service layer instead of the controller.
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
