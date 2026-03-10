const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

const buildJobWhere = (query) => {
  const where = {};

  // Convert query params into Prisma relation filters.
  if (query.department) {
    where.department = {
      name: { equals: query.department, mode: "insensitive" },
    };
  }

  if (query.location) {
    where.location = {
      name: { equals: query.location, mode: "insensitive" },
    };
  }

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  if (query.search) {
    // Keyword search across the most common recruiter fields.
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const getJobs = async (query) => {
  const where = buildJobWhere(query);
  const { page, limit, skip } = parsePagination(query);
  const sortMap = { created_at: "createdAt", title: "title", status: "status" };
  const normalizedQuery = {
    ...query,
    sort: sortMap[query.sort] || query.sort,
  };
  const orderBy = parseSort(normalizedQuery, ["createdAt", "title", "status"], "createdAt");

  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        department: true,
        location: true,
        skills: { include: { skill: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
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

const createJob = (data, userId) => {
  return prisma.job.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status || "OPEN",
      minSalary: data.minSalary,
      maxSalary: data.maxSalary,
      openings: data.openings || 1,
      departmentId: data.departmentId,
      locationId: data.locationId,
      createdById: userId,
      publishedAt: data.status === "OPEN" ? new Date() : null,
    },
  });
};

const updateJob = (id, data) => {
  return prisma.job.update({
    where: { id },
    data,
  });
};

const deleteJob = (id) => {
  return prisma.job.delete({ where: { id } });
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
};
