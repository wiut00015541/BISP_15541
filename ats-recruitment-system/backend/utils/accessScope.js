const isAdmin = (user) => user?.role === "admin";

const buildAssignedJobScope = (user) => {
  if (isAdmin(user)) {
    return {};
  }

  return {
    OR: [{ recruiterId: user.id }, { hiringManagerId: user.id }],
  };
};

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
