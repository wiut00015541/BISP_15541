// accessScope holds shared backend helpers used across the app.
const isAdmin = (user) => user?.role === "admin";

// Build the job filter that limits non-admin users to their assigned jobs.
const buildAssignedJobScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
  };
};

// Build the nested job filter used inside related Prisma queries.
const buildAssignedJobRelationScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
  };
};

module.exports = {
  isAdmin,
  buildAssignedJobScope,
  buildAssignedJobRelationScope,
};
