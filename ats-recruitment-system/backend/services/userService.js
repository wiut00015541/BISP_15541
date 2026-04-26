// userService contains backend business logic for this area.
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const includeUserRelations = {
  role: true,
  department: true,
};

const includeUserWithPermissions = {
  role: {
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  },
  department: true,
};

const isTruthyBoolean = (value) => value === true || value === "true";

const sanitizeCurrentUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role?.name || null,
  permissions: user.role?.rolePermissions?.map((item) => item.permission.key) || [],
  department: user.department ? { id: user.department.id, name: user.department.name } : null,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

// Validate user payload before the database work starts.
const validateUserPayload = async (payload, existingUserId = null) => {
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

  if (!payload.roleName) {
    errors.roleName = "Role is required";
  }

  if (!existingUserId && !payload.password?.trim()) {
    errors.password = "Password is required";
  } else if (payload.password && payload.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  const [existingUser, role] = await Promise.all([
    prisma.user.findFirst({
      where: {
        email: payload.email,
        ...(existingUserId ? { id: { not: existingUserId } } : {}),
      },
    }),
    payload.roleName ? prisma.role.findUnique({ where: { name: payload.roleName } }) : null,
  ]);

  if (existingUser) {
    errors.email = "Email is already in use";
  }

  if (payload.roleName && !role) {
    errors.roleName = "Selected role is invalid";
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return role;
};

// Keep ensure manageable user inside the service layer instead of the controller.
const ensureManageableUser = async (targetUserId, actorUserId) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: includeUserRelations,
  });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (targetUserId === actorUserId) {
    const error = new Error("You cannot modify your own account with this action");
    error.status = 400;
    throw error;
  }

  return user;
};

// Keep ensure admin safety inside the service layer instead of the controller.
const ensureAdminSafety = async (userId, nextRoleName, nextIsActive, isDelete = false) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    return;
  }

  const removingAdminPrivileges =
    user.role?.name === "admin" &&
    (isDelete || nextRoleName !== "admin" || nextIsActive === false);

  if (!removingAdminPrivileges) {
    return;
  }

  const activeAdminCount = await prisma.user.count({
    where: {
      isActive: true,
      role: { name: "admin" },
    },
  });

  if (activeAdminCount <= 1) {
    const error = new Error("At least one active System Administrator must remain");
    error.status = 400;
    error.details = { roleName: "At least one active System Administrator must remain" };
    throw error;
  }
};

// Load users with the business rules for this area.
const getUsers = async (query) => {
  const where = {};

  if (query.role) {
    where.role = {
      name: query.role,
    };
  }

  if (query.isActive === "true" || query.isActive === "false") {
    where.isActive = query.isActive === "true";
  }

  return prisma.user.findMany({
    where,
    include: includeUserRelations,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
};

// Load current user with the business rules for this area.
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: includeUserWithPermissions,
  });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return sanitizeCurrentUser(user);
};

// Update current user while keeping the workflow rules consistent.
const updateCurrentUser = async (userId, payload) => {
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

  if (payload.password && payload.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
      id: { not: userId },
    },
  });

  if (existingUser) {
    errors.email = "Email is already in use";
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  const data = {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim(),
  };

  if (payload.password?.trim()) {
    data.passwordHash = await bcrypt.hash(payload.password.trim(), 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: includeUserWithPermissions,
  });

  return sanitizeCurrentUser(user);
};

// Create user and apply the related business rules.
const createUser = async (payload) => {
  const role = await validateUserPayload(payload);
  const passwordHash = await bcrypt.hash(payload.password, 10);

  return prisma.user.create({
    data: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      passwordHash,
      roleId: role.id,
      departmentId: payload.departmentId || null,
      isActive: payload.isActive === undefined ? true : isTruthyBoolean(payload.isActive),
    },
    include: includeUserRelations,
  });
};

// Refresh the stored user profile without replacing the current token.
const updateUser = async (userId, payload, actorUserId) => {
  await ensureManageableUser(userId, actorUserId);
  const role = await validateUserPayload(payload, userId);
  const nextIsActive = payload.isActive === undefined ? undefined : isTruthyBoolean(payload.isActive);

  await ensureAdminSafety(userId, role.name, nextIsActive);

  const data = {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim(),
    roleId: role.id,
    departmentId: payload.departmentId || null,
  };

  if (payload.password?.trim()) {
    data.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  if (nextIsActive !== undefined) {
    data.isActive = nextIsActive;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    include: includeUserRelations,
  });
};

// Keep toggle user status inside the service layer instead of the controller.
const toggleUserStatus = async (userId, actorUserId) => {
  const user = await ensureManageableUser(userId, actorUserId);
  await ensureAdminSafety(userId, user.role?.name, !user.isActive);

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    include: includeUserRelations,
  });
};

// Delete user after the access checks pass.
const deleteUser = async (userId, actorUserId) => {
  await ensureManageableUser(userId, actorUserId);
  await ensureAdminSafety(userId, "admin", false, true);

  return prisma.user.delete({
    where: { id: userId },
  });
};

module.exports = {
  getUsers,
  getCurrentUser,
  createUser,
  updateCurrentUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};
