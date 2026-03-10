const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
