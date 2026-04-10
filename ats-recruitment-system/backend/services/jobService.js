const prisma = require("../config/prisma");
const { parsePagination, parseSort } = require("../utils/apiFeatures");
const { buildAssignedJobScope } = require("../utils/accessScope");

const includeJobRelations = {
  department: true,
  location: true,
  recruiter: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  hiringManager: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  skills: { include: { skill: true } },
};

const buildJobWhere = (query, user) => {
  const where = buildAssignedJobScope(user);

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
    where.status = { equals: query.status, mode: "insensitive" };
  }

  if (query.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  return where;
};

const validateJobPayload = async (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Job title is required";
  }

  if (!data.description?.trim()) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < 30) {
    errors.description = "Description must be at least 30 characters";
  }

  if (!data.departmentId) {
    errors.departmentId = "Department is required";
  }

  if (!data.locationId) {
    errors.locationId = "Location is required";
  }

  if (!data.recruiterId) {
    errors.recruiterId = "Recruiter is required";
  }

  if (!data.hiringManagerId) {
    errors.hiringManagerId = "Hiring manager is required";
  }

  if (!data.type) {
    errors.type = "Job type is required";
  }

  if (!data.status) {
    errors.status = "Status is required";
  }

  const openings = Number(data.openings || 1);
  if (!Number.isInteger(openings) || openings < 1) {
    errors.openings = "Openings must be at least 1";
  }

  const minSalary =
    data.minSalary === "" || data.minSalary === null || data.minSalary === undefined ? null : Number(data.minSalary);
  const maxSalary =
    data.maxSalary === "" || data.maxSalary === null || data.maxSalary === undefined ? null : Number(data.maxSalary);

  if (minSalary !== null && Number.isNaN(minSalary)) {
    errors.minSalary = "Minimum salary must be a number";
  }

  if (maxSalary !== null && Number.isNaN(maxSalary)) {
    errors.maxSalary = "Maximum salary must be a number";
  }

  if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
    errors.maxSalary = "Maximum salary must be greater than or equal to minimum salary";
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  const [recruiter, hiringManager] = await Promise.all([
    prisma.user.findFirst({
      where: { id: data.recruiterId, isActive: true, role: { name: "recruiter" } },
    }),
    prisma.user.findFirst({
      where: { id: data.hiringManagerId, isActive: true, role: { name: "hiring_manager" } },
    }),
  ]);

  if (!recruiter || !hiringManager) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = {
      recruiterId: recruiter ? undefined : "Selected recruiter is invalid",
      hiringManagerId: hiringManager ? undefined : "Selected hiring manager is invalid",
    };
    throw error;
  }
};

const getJobs = async (query, user) => {
  const where = buildJobWhere(query, user);
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
      include: includeJobRelations,
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

const getJobById = (id, user) => {
  return prisma.job.findFirst({
    where: {
      id,
      ...buildAssignedJobScope(user),
    },
    include: {
      ...includeJobRelations,
      applications: {
        include: {
          candidate: true,
          currentStage: true,
        },
      },
    },
  });
};

const createJob = async (data, userId) => {
  await validateJobPayload(data);

  return prisma.job.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      type: data.type,
      status: data.status || "OPEN",
      minSalary: data.minSalary ? Number(data.minSalary) : null,
      maxSalary: data.maxSalary ? Number(data.maxSalary) : null,
      openings: data.openings ? Number(data.openings) : 1,
      departmentId: data.departmentId,
      locationId: data.locationId,
      recruiterId: data.recruiterId,
      hiringManagerId: data.hiringManagerId,
      createdById: userId,
      publishedAt: (data.status || "OPEN") === "OPEN" ? new Date() : null,
    },
    include: includeJobRelations,
  });
};

const updateJob = async (id, data, user) => {
  await validateJobPayload(data);

  const existingJob = await prisma.job.findFirst({
    where: { id, ...buildAssignedJobScope(user) },
  });

  if (!existingJob) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  return prisma.job.update({
    where: { id },
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      type: data.type,
      status: data.status,
      departmentId: data.departmentId,
      locationId: data.locationId,
      recruiterId: data.recruiterId,
      hiringManagerId: data.hiringManagerId,
      minSalary: data.minSalary ? Number(data.minSalary) : null,
      maxSalary: data.maxSalary ? Number(data.maxSalary) : null,
      openings: data.openings ? Number(data.openings) : 1,
      publishedAt: data.status === "OPEN" ? new Date() : null,
    },
    include: includeJobRelations,
  });
};

const deleteJob = async (id, user) => {
  const existingJob = await prisma.job.findFirst({
    where: { id, ...buildAssignedJobScope(user) },
  });

  if (!existingJob) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  return prisma.job.delete({ where: { id } });
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
