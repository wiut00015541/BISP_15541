const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

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

const buildCandidateWhere = (query) => {
  const where = {};

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
    where.OR = [
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const getCandidates = async (query) => {
  const where = buildCandidateWhere(query);
  const { page, limit, skip } = parsePagination(query);
  const sortMap = { created_at: "createdAt", experience: "yearsExperience" };
  const normalizedQuery = { ...query, sort: sortMap[query.sort] || query.sort };
  const orderBy = parseSort(normalizedQuery, ["createdAt", "firstName", "yearsExperience"], "createdAt");

  const [data, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      include: {
        skills: { include: { skill: true } },
        resumes: true,
        applications: { include: { currentStage: true, job: true } },
      },
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

const getCandidateById = (id) => {
  return prisma.candidate.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      resumes: true,
      notes: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "desc" },
      },
      applications: {
        include: {
          job: true,
          currentStage: true,
        },
      },
    },
  });
};

const createCandidate = async (payload, file, uploadedById) => {
  const skills = normalizeSkillIds(payload.skillIds);
  if (!payload.jobId) {
    const error = new Error("jobId is required");
    error.status = 400;
    throw error;
  }

  const [job, appliedStage] = await Promise.all([
    prisma.job.findFirst({
      where: {
        id: payload.jobId,
        status: "OPEN",
      },
    }),
    prisma.stage.findFirst({ where: { name: "Applied" } }),
  ]);

  if (!job) {
    const error = new Error("Selected job must be open");
    error.status = 400;
    throw error;
  }

  if (!appliedStage) {
    const error = new Error("Pipeline stage not configured");
    error.status = 500;
    throw error;
  }

  const candidate = await prisma.$transaction(async (tx) => {
    const createdCandidate = await tx.candidate.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        yearsExperience: payload.yearsExperience ? Number(payload.yearsExperience) : null,
        source: payload.source,
        assignedToId: payload.assignedToId,
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
    include: {
      skills: { include: { skill: true } },
      resumes: true,
      applications: { include: { currentStage: true, job: true } },
    },
  });
};

const updateCandidate = async (id, payload, file, uploadedById) => {
  const skills = normalizeSkillIds(payload.skillIds);

  await prisma.candidate.update({
    where: { id },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
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
    include: {
      skills: { include: { skill: true } },
      resumes: true,
      applications: { include: { currentStage: true, job: true } },
    },
  });
};

const deleteCandidate = (id) => {
  return prisma.candidate.delete({
    where: { id },
  });
};

const addCandidateNote = (candidateId, authorId, content, isPrivate = false) => {
  return prisma.candidateNote.create({
    data: {
      candidateId,
      authorId,
      content,
      isPrivate,
    },
  });
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  addCandidateNote,
};
