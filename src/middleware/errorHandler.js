import AppError from "../errors/AppError.js";

const allowedErrors = new Set([
  "ValidationError",
  "BadRequestError",
  "UnauthorizedError",
  "ForbiddenError",
  "NotFoundError",
  "ConflictError",
  "UnprocessableEntityError",
  "TooManyRequestsError",
  "ServiceUnavailableError",
]);

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    const errorMethod = err.name;

    if (allowedErrors.has(errorMethod)) {
      return res.status(err.statusCode).json({
        success: false,
        error: errorMethod,
        message: err.message,
        ...(err.details && {
          details: err.details,
        }),
      });
    }
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: `Invalid ${err.path}`,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "ValidationError",
      message: Object.values(err.errors)
        .map(error => error.message)
        .join(", "),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(409).json({
      success: false,
      error: "ConflictError",
      message: `${field} already exists`,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    error: "InternalServerError",
    message: "Something went wrong",
  });
};

export default errorHandler;