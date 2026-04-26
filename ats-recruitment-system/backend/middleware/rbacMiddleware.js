// rbacMiddleware runs request checks before the controller layer.
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const allowed = requiredPermissions.some((permission) => userPermissions.includes(permission));

    if (!allowed) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
};

module.exports = {
  requirePermission,
};
