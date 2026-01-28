function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFoundHandler };