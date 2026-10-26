const { failure } = require("../utils/response");

function notFoundHandler(req, res) {
  return failure(res, "Route not found", 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "23505") {
    return failure(res, "A record with these details already exists", 409);
  }
  if (err.code === "23503") {
    return failure(res, "This action violates a required data relationship", 409);
  }
  if (err.code === "23514") {
    return failure(res, "Invalid data provided", 400);
  }

  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  return failure(res, message, status);
}

module.exports = { notFoundHandler, errorHandler };
