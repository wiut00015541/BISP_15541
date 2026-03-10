const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role?.name,
});

const register = async ({ firstName, lastName, email, password, roleName = "recruiter" }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    const error = new Error("Role not found");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId: role.id,
    },
    include: { role: true },
  });

  const token = generateToken({ userId: user.id, role: user.role.name });

  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = generateToken({ userId: user.id, role: user.role.name });
  return { user: sanitizeUser(user), token };
};

module.exports = {
  register,
  login,
};
