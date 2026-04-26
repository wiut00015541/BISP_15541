// applicationService contains backend business logic for this area.
const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");
const { isAdmin } = require("../utils/accessScope");
const { sendEmail, renderEmailTemplate, getManagedEmailTemplate } = require("../utils/emailService");

// Build the Prisma filter used for accessible application.
const buildAccessibleApplicationWhere = (query, user) => {
  const where = {};

  if (!isAdmin(user)) {
    where.job = {
      OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
    };
  }

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

// Load applications with the business rules for this area.
const getApplications = async (query, user) => {
  const where = buildAccessibleApplicationWhere(query, user);
  const { page, limit, skip } = parsePagination(query);
  const sortMap = { created_at: "appliedAt", updated_at: "updatedAt" };
  const normalizedQuery = { ...query, sort: sortMap[query.sort] || query.sort };
  const orderBy = parseSort(normalizedQuery, ["appliedAt", "updatedAt", "score"], "appliedAt");

  const [data, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        candidate: true,
        job: {
          include: {
            recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
            hiringManager: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
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

// Create application and apply the related business rules.
const createApplication = async (payload, userId, user) => {
  if (!payload.candidateId || !payload.jobId) {
    const error = new Error("Candidate and job are required");
    error.status = 400;
    throw error;
  }

  const stage = await prisma.stage.findFirst({ where: { name: "Applied" } });
  if (!stage) {
    const error = new Error("Pipeline stage not configured");
    error.status = 500;
    throw error;
  }

  const [job, candidate, existingApplication] = await Promise.all([
    prisma.job.findFirst({
      where: {
        id: payload.jobId,
        status: "OPEN",
        ...(isAdmin(user) ? {} : { OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }] }),
      },
    }),
    prisma.candidate.findFirst({
      where: {
        id: payload.candidateId,
        ...(isAdmin(user)
          ? {}
          : {
              OR: [
                { assignedToId: user.id },
                {
                  applications: {
                    some: {
                      job: {
                        OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
                      },
                    },
                  },
                },
              ],
            }),
      },
    }),
    prisma.application.findFirst({
      where: {
        candidateId: payload.candidateId,
        jobId: payload.jobId,
      },
    }),
  ]);

  if (!candidate) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }

  if (!job) {
    const error = new Error("Selected job must be open and assigned to you");
    error.status = 400;
    throw error;
  }

  if (existingApplication) {
    const error = new Error("Candidate is already assigned to this job");
    error.status = 409;
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

// Update application stage while keeping the workflow rules consistent.
const updateApplicationStage = async (applicationId, stageName, changedById, note, user) => {
  let [application, nextStage] = await Promise.all([
    prisma.application.findFirst({
      where: {
        id: applicationId,
        ...buildAccessibleApplicationWhere({}, user),
      },
      include: {
        job: true,
      },
    }),
    prisma.stage.findFirst({
      where: { name: { equals: stageName, mode: "insensitive" } },
    }),
  ]);

  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    throw error;
  }

  if (!nextStage && String(stageName).toLowerCase() === "withdrawn") {
    // "Withdrawn" is created on demand so older databases can still use the action.
    const maxOrderStage = await prisma.stage.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    nextStage = await prisma.stage.create({
      data: {
        name: "Withdrawn",
        order: (maxOrderStage?.order || 0) + 1,
        isTerminal: true,
      },
    });
  }

  if (!nextStage) {
    const error = new Error("Stage not found");
    error.status = 404;
    throw error;
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { currentStageId: nextStage.id },
    include: { currentStage: true },
  });

  await prisma.applicationHistory.create({
    data: {
      applicationId,
      fromStageId: application.currentStageId,
      toStageId: nextStage.id,
      changedById,
      note,
    },
  });

  if (String(nextStage.name).toLowerCase() === "hired") {
    // Hiring a candidate closes the job automatically in the current workflow.
    await prisma.job.update({
      where: { id: application.jobId },
      data: {
        status: "CLOSED",
      },
    });
  }

  return updated;
};

// Revert hired application while restoring the related workflow state.
const revertHiredApplication = async (applicationId, changedById, user) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...buildAccessibleApplicationWhere({}, user),
    },
    include: {
      job: true,
      currentStage: true,
      history: {
        include: {
          fromStage: true,
          toStage: true,
        },
        orderBy: { changedAt: "desc" },
      },
    },
  });

  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    throw error;
  }

  if (String(application.currentStage?.name || "").toLowerCase() !== "hired") {
    const error = new Error("Only hired applications can be reverted");
    error.status = 400;
    throw error;
  }

  const hiredTransition = application.history.find(
    (entry) => String(entry.toStage?.name || "").toLowerCase() === "hired" && entry.fromStage
  );

  let fallbackStage = null;
  if (!hiredTransition?.fromStageId) {
    // Fall back to the last sensible active stage if the history is incomplete.
    fallbackStage = await prisma.stage.findFirst({
      where: {
        name: { in: ["Offer", "Interview", "Screening", "Applied"] },
      },
      orderBy: { order: "desc" },
    });
  }

  const previousStageId = hiredTransition?.fromStageId || fallbackStage?.id;

  if (!previousStageId) {
    const error = new Error("A previous stage could not be resolved for this hired application");
    error.status = 400;
    throw error;
  }

  const reverted = await prisma.application.update({
    where: { id: applicationId },
    data: { currentStageId: previousStageId },
    include: { currentStage: true },
  });

  await prisma.applicationHistory.create({
    data: {
      applicationId,
      fromStageId: application.currentStageId,
      toStageId: previousStageId,
      changedById,
      note: "Hired status reversed from candidate profile",
    },
  });

  if (String(application.job?.status || "").toUpperCase() === "CLOSED") {
    await prisma.job.update({
      where: { id: application.jobId },
      data: {
        status: "OPEN",
      },
    });
  }

  return reverted;
};

// Schedule interview and handle the side effects around it.
const scheduleInterview = async (applicationId, payload, user) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...buildAccessibleApplicationWhere({}, user),
    },
    include: {
      candidate: true,
      job: true,
      currentStage: true,
    },
  });

  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    throw error;
  }

  const [stage, interviewer] = await Promise.all([
    payload.stageId
      ? prisma.stage.findUnique({ where: { id: payload.stageId } })
      : prisma.stage.findFirst({ where: { name: "Interview" } }),
    prisma.user.findUnique({ where: { id: payload.interviewerId }, include: { role: true } }),
  ]);

  if (!stage) {
    const error = new Error("Interview stage not found");
    error.status = 400;
    throw error;
  }

  if (!interviewer) {
    const error = new Error("Interviewer not found");
    error.status = 400;
    throw error;
  }

  if (!payload.scheduledAt) {
    const error = new Error("Scheduled date is required");
    error.status = 400;
    error.details = { scheduledAt: "Scheduled date is required" };
    throw error;
  }

  const interview = await prisma.interview.create({
    data: {
      applicationId,
      stageId: stage.id,
      interviewerId: payload.interviewerId,
      scheduledAt: new Date(payload.scheduledAt),
      durationMinutes: payload.durationMinutes || 60,
      meetingLink: payload.meetingLink,
    },
    include: {
      stage: true,
      interviewer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      application: {
        include: {
          candidate: true,
          job: true,
        },
      },
    },
  });

  const formattedDate = new Date(interview.scheduledAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const interviewTemplate = await getManagedEmailTemplate(
    payload.templateCode || "interview_invitation",
    {
      subject: "Interview scheduled for {{jobTitle}}",
      heading: "Interview scheduled for {{jobTitle}}",
      intro:
        "Hello {{candidateFirstName}}, your interview for {{jobTitle}} has been scheduled for {{formattedDate}}.",
      closing: "ATS Recruitment Team",
    },
    {
      candidateFirstName: application.candidate.firstName,
      candidateLastName: application.candidate.lastName,
      jobTitle: application.job.title,
      formattedDate,
      interviewerName: `${interviewer.firstName} ${interviewer.lastName}`,
      meetingLink: payload.meetingLink || "To be shared soon",
    }
  );

  await sendEmail({
    to: application.candidate.email,
    subject: interviewTemplate.subject,
    text: `Hello ${application.candidate.firstName},\n\nYour interview for ${application.job.title} has been scheduled for ${formattedDate}.\nInterviewer: ${interviewer.firstName} ${interviewer.lastName}\nMeeting link: ${payload.meetingLink || "To be shared soon"}\n\nBest regards,\nATS Recruitment Team`,
    html: renderEmailTemplate({
      heading: interviewTemplate.heading,
      intro: interviewTemplate.intro,
      sections: [
        { label: "Role", value: application.job.title },
        { label: "Date and time", value: formattedDate },
        { label: "Interviewer", value: `${interviewer.firstName} ${interviewer.lastName}` },
        { label: "Meeting link", value: payload.meetingLink || "To be shared soon" },
      ],
      closing: interviewTemplate.closing,
    }),
  });

  return interview;
};

// Add interview feedback inside the current workflow.
const addInterviewFeedback = async (interviewId, payload, reviewerId, user) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      application: buildAccessibleApplicationWhere({}, user),
    },
  });

  if (!interview) {
    const error = new Error("Interview not found");
    error.status = 404;
    throw error;
  }

  if (!payload.rating || Number(payload.rating) < 1 || Number(payload.rating) > 5) {
    const error = new Error("Rating must be between 1 and 5");
    error.status = 400;
    error.details = { rating: "Rating must be between 1 and 5" };
    throw error;
  }

  return prisma.interviewFeedback.create({
    data: {
      interviewId,
      reviewerId,
      rating: Number(payload.rating),
      strengths: payload.strengths,
      concerns: payload.concerns,
      recommendation: payload.recommendation,
    },
    include: {
      reviewer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
};

module.exports = {
  getApplications,
  createApplication,
  updateApplicationStage,
  revertHiredApplication,
  scheduleInterview,
  addInterviewFeedback,
};
