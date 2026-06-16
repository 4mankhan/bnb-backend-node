//extending base class Error
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  //custom methods or each error type
  static ValidationError(
    message = "Validation failed",
    statusCode = 400,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static BadRequestError(
    message = "Bad request",
    statusCode = 400,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static UnauthorizedError(
    message = "Unauthorized",
    statusCode = 401,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static ForbiddenError(
    message = "Forbidden",
    statusCode = 403,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static NotFoundError(
    message = "Resource not found",
    statusCode = 404,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static ConflictError(
    message = "Resource already exists",
    statusCode = 409,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static UnprocessableEntityError(
    message = "Unprocessable entity",
    statusCode = 422,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static TooManyRequestsError(
    message = "Too many requests",
    statusCode = 429,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }

  static ServiceUnavailableError(
    message = "Service unavailable",
    statusCode = 503,
    details = null
  ) {
    return new AppError(message, statusCode, details);
  }
}

export default AppError;