//extending base class Error
class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    details = null,
    errorType = "InternalServerError"
  ) {
    super(message);

    this.name = errorType;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static ValidationError(
    message = "Validation failed",
    statusCode = 400,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "ValidationError"
    );
  }

  static BadRequestError(
    message = "Bad request",
    statusCode = 400,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "BadRequestError"
    );
  }

  static UnauthorizedError(
    message = "Unauthorized",
    statusCode = 401,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "UnauthorizedError"
    );
  }

  static ForbiddenError(
    message = "Forbidden",
    statusCode = 403,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "ForbiddenError"
    );
  }

  static NotFoundError(
    message = "Resource not found",
    statusCode = 404,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "NotFoundError"
    );
  }

  static ConflictError(
    message = "Resource already exists",
    statusCode = 409,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "ConflictError"
    );
  }

  static UnprocessableEntityError(
    message = "Unprocessable entity",
    statusCode = 422,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "UnprocessableEntityError"
    );
  }

  static TooManyRequestsError(
    message = "Too many requests",
    statusCode = 429,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "TooManyRequestsError"
    );
  }

  static ServiceUnavailableError(
    message = "Service unavailable",
    statusCode = 503,
    details = null
  ) {
    return new AppError(
      message,
      statusCode,
      details,
      "ServiceUnavailableError"
    );
  }
}

export default AppError;