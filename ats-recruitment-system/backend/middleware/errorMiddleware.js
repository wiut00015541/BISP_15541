// errorMiddleware runs request checks before the controller layer.
const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Run error handler before the request reaches the route handler.
const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    details: err.details || undefined,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
