const path = require("path");
const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");
const { isAdmin } = require("../utils/accessScope");
const { sendEmail, renderEmailTemplate, getManagedEmailTemplate } = require("../utils/emailService");
const { analyzeResume } = require("./aiService");

const normalizeSkillIds = (skillIds) => {
  if (!skillIds) {
    return [];
  }

  if (Array.isArray(skillIds)) {
    return skillIds.filter(Boolean);
  }

  try {
    const parsed = JSON.parse(skillIds);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_error) {
    return String(skillIds)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const serializeCommunicationContent = ({ subject, body }) =>
  JSON.stringify({
    format: "candidate_email",
    subject,
    body,
  });

const parseCommunicationContent = (content) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.format === "candidate_email") {
      return parsed;
    }
  } catch (_error) {
    return { subject: "Communication", body: content };
  }

  return { subject: "Communication", body: content };
};

const buildAccessibleCandidateWhere = (query, user) => {
  const where = {};

  if (!isAdmin(user)) {
    where.OR = [
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
    ];
  }

  if (query.skill) {
    where.skills = {
      some: {
        skill: {
          name: { equals: query.skill, mode: "insensitive" },
        },
      },
    };
  }

  if (query.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  return where;
};

const includeCandidateRelations = {
  skills: { include: { skill: true } },
  resumes: {
    include: {
      uploadedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  applications: {
    include: {
      currentStage: true,
      job: {
        include: {
          department: true,
          recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
          hiringManager: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      interviews: {
        include: {
          stage: true,
          interviewer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          feedback: {
            include: {
              reviewer: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  },
};

const validateCandidatePayload = (payload) => {
  const errors = {};

  if (!payload.firstName?.trim()) {
    errors.firstName = "First name is required";
  }

  if (!payload.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!payload.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "Email format is invalid";
  }

  if (!payload.jobId) {
    errors.jobId = "Open job selection is required";
  }

  if (payload.yearsExperience && Number.isNaN(Number(payload.yearsExperience))) {
    errors.yearsExperience = "Years of experience must be numeric";
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }
};

const getCandidates = async (query, user) => {
  const where = buildAccessibleCandidateWhere(query, user);
  const { page, limit, skip } = parsePagination(query);
  const sortMap = { created_at: "createdAt", experience: "yearsExperience" };
  const normalizedQuery = { ...query, sort: sortMap[query.sort] || query.sort };
  const orderBy = parseSort(normalizedQuery, ["createdAt", "firstName", "yearsExperience"], "createdAt");

  const [data, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      include: includeCandidateRelations,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.candidate.count({ where }),
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

const mapCandidateProfile = (candidate) => {
  if (!candidate) {
    return null;
  }

  return {
    ...candidate,
    communications: (candidate.messages || []).map((message) => ({
      id: message.id,
      sentAt: message.sentAt,
      readAt: message.readAt,
      status: "sent",
      sender: message.sender,
      ...parseCommunicationContent(message.content),
    })),
  };
};

const getCandidateById = async (id, user) => {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id,
      ...buildAccessibleCandidateWhere({}, user),
    },
    include: {
      ...includeCandidateRelations,
      notes: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
      },
      messages: {
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        where: {
          candidateId: id,
        },
        orderBy: { sentAt: "desc" },
      },
    },
  });

  return mapCandidateProfile(candidate);
};

const analyzeCandidateResume = async (candidateId, resumeId, user) => {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      ...buildAccessibleCandidateWhere({}, user),
    },
    include: {
      resumes: true,
    },
  });

  if (!candidate) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }

  const resume = candidate.resumes.find((item) => item.id === resumeId);

  if (!resume) {
    const error = new Error("Resume not found");
    error.status = 404;
    throw error;
  }

  if (!resume.rawText && !resume.fileUrl) {
    const error = new Error("Resume file or extracted text is required for AI analysis");
    error.status = 400;
    throw error;
  }

  const absoluteFilePath = resume.fileUrl
    ? path.join(__dirname, "..", resume.fileUrl.replace(/^\/+/, ""))
    : null;

  const analysis = await analyzeResume({
    resumeText: resume.rawText,
    filePath: absoluteFilePath,
    filename: resume.fileUrl ? path.basename(resume.fileUrl) : undefined,
  });

  const updatedResume = await prisma.resume.update({
    where: { id: resume.id },
    data: {
      aiSummary: analysis.summary,
      aiSkills: analysis.skills,
      aiExperience: analysis.experience,
      parsedAt: new Date(),
    },
    include: {
      uploadedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return {
    resume: updatedResume,
    analysis,
  };
};

const createCandidate = async (payload, file, uploadedById, user) => {
  const skills = normalizeSkillIds(payload.skillIds);
  validateCandidatePayload(payload);

  const [job, appliedStage] = await Promise.all([
    prisma.job.findFirst({
      where: {
        id: payload.jobId,
        status: "OPEN",
        ...(isAdmin(user) ? {} : { OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }] }),
      },
    }),
    prisma.stage.findFirst({ where: { name: "Applied" } }),
  ]);

  if (!job) {
    const error = new Error("Selected job must be open and assigned to you");
    error.status = 400;
    error.details = { jobId: "Selected job is invalid" };
    throw error;
  }

  if (!appliedStage) {
    const error = new Error("Pipeline stage not configured");
    error.status = 500;
    throw error;
  }

  let candidate;

  try {
    candidate = await prisma.$transaction(async (tx) => {
      const createdCandidate = await tx.candidate.create({
        data: {
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          email: payload.email.trim(),
          phone: payload.phone,
          yearsExperience: payload.yearsExperience ? Number(payload.yearsExperience) : null,
          source: payload.source,
          assignedToId: payload.assignedToId || job.recruiterId,
          skills: {
            create: skills.map((skillId) => ({
              skillId,
            })),
          },
        },
        include: {
          skills: { include: { skill: true } },
        },
      });

      const application = await tx.application.create({
        data: {
          candidateId: createdCandidate.id,
          jobId: payload.jobId,
          currentStageId: appliedStage.id,
          source: payload.source || "manual",
        },
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: application.id,
          toStageId: appliedStage.id,
          changedById: uploadedById,
          note: "Candidate manually added to job",
        },
      });

      return createdCandidate;
    });
  } catch (error) {
    if (error?.code === "P2002") {
      const duplicateError = new Error("A candidate with this email already exists");
      duplicateError.status = 409;
      duplicateError.details = { email: "This email is already used by another candidate" };
      throw duplicateError;
    }

    throw error;
  }

  if (file) {
    await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        uploadedById,
        fileUrl: `/uploads/resumes/${file.filename}`,
      },
    });
  }

  return prisma.candidate.findUnique({
    where: { id: candidate.id },
    include: includeCandidateRelations,
  });
};

const updateCandidate = async (id, payload, file, uploadedById, user) => {
  validateCandidatePayload({ ...payload, jobId: payload.jobId || "existing" });
  const skills = normalizeSkillIds(payload.skillIds);
  const existing = await prisma.candidate.findFirst({
    where: {
      id,
      ...buildAccessibleCandidateWhere({}, user),
    },
  });

  if (!existing) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }

  await prisma.candidate.update({
    where: { id },
    data: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      phone: payload.phone,
      yearsExperience: payload.yearsExperience ? Number(payload.yearsExperience) : null,
      source: payload.source,
      assignedToId: payload.assignedToId || null,
      skills: {
        deleteMany: {},
        create: skills.map((skillId) => ({ skillId })),
      },
    },
  });

  if (file) {
    await prisma.resume.create({
      data: {
        candidateId: id,
        uploadedById,
        fileUrl: `/uploads/resumes/${file.filename}`,
      },
    });
  }

  return prisma.candidate.findUnique({
    where: { id },
    include: includeCandidateRelations,
  });
};

const deleteCandidate = async (id, user) => {
  const existing = await prisma.candidate.findFirst({
    where: {
      id,
      ...buildAccessibleCandidateWhere({}, user),
    },
  });

  if (!existing) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }

  return prisma.candidate.delete({
    where: { id },
  });
};

const addCandidateNote = async (candidateId, authorId, content, isPrivate = false, user) => {
  const existing = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      ...buildAccessibleCandidateWhere({}, user),
    },
  });

  if (!existing) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }

  return prisma.candidateNote.create({
    data: {
      candidateId,
      authorId,
      content,
      isPrivate,
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
};

const sendCandidateCommunication = async (candidateId, payload, sender, user) => {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      ...buildAccessibleCandidateWhere({}, user),
    },
  });

  if (!candidate) {
    const error = new Error("Candidate not found");
    error.status = 404;
    throw error;
  }

  if (!payload.subject?.trim() || !payload.body?.trim()) {
    const error = new Error("Subject and message are required");
    error.status = 400;
    error.details = {
      subject: payload.subject?.trim() ? undefined : "Subject is required",
      body: payload.body?.trim() ? undefined : "Message is required",
    };
    throw error;
  }

  const senderName = `${sender.firstName || ""} ${sender.lastName || ""}`.trim() || sender.email;

  const outreachTemplate = await getManagedEmailTemplate(
    "candidate_outreach",
    {
      heading: payload.subject.trim(),
      closing: "{{senderName}}",
    },
    {
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      senderName,
    }
  );

  await sendEmail({
    to: candidate.email,
    subject: payload.subject.trim(),
    text: `${payload.body.trim()}\n\nSent by ${senderName}`,
    html: renderEmailTemplate({
      heading: outreachTemplate.heading || payload.subject.trim(),
      intro: payload.body.trim().replace(/\n/g, "<br />"),
      sections: [
        {
          label: "Candidate",
          value: `${candidate.firstName} ${candidate.lastName}`,
        },
        {
          label: "Sent by",
          value: senderName,
        },
      ],
      closing: outreachTemplate.closing || senderName,
    }),
  });

  const message = await prisma.message.create({
    data: {
      senderId: sender.id,
      receiverId: sender.id,
      candidateId,
      content: serializeCommunicationContent({
        subject: payload.subject.trim(),
        body: payload.body.trim(),
      }),
    },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return {
    id: message.id,
    sender: message.sender,
    sentAt: message.sentAt,
    subject: payload.subject.trim(),
    body: payload.body.trim(),
  };
};

module.exports = {
  getCandidates,
  getCandidateById,
  analyzeCandidateResume,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  addCandidateNote,
  sendCandidateCommunication,
};
