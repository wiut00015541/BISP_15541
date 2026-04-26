// apiFeatures holds shared backend helpers used across the app.
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Parse requested sort options into a Prisma-compatible order clause.
const parseSort = (query, allowedFields, defaultField = "createdAt") => {
  const requestedField = query.sort;
  const sortField = allowedFields.includes(requestedField) ? requestedField : defaultField;
  const sortOrder = query.order === "asc" ? "asc" : "desc";

  return { [sortField]: sortOrder };
};

module.exports = {
  parsePagination,
  parseSort,
};
