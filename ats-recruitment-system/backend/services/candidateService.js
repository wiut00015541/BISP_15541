const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

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

const createCandidate = (payload) => {
  const skills = payload.skillIds || [];

  return prisma.candidate.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      yearsExperience: payload.yearsExperience,
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
  createCandidate,
  addCandidateNote,
};
