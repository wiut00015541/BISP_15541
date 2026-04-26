// Shared Prisma client setup for backend database access.
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

module.exports = prisma;
