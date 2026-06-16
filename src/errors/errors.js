import AppError from "./AppError.js";

class ValidationError extends AppError {
  constructor(message = "Validation failed", statusCode = 400) {
    super(message, statusCode);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource notyyyyyyyyyy found", statusCode = 404) {
    super(message, statusCode);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", statusCode = 401) {
    super(message, statusCode);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden", statusCode = 403) {
    super(message, statusCode);
  }
}

export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};