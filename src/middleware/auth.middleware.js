import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    throw AppError.UnauthorizedError(
      "Authentication token is required"
    );
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch {
    throw AppError.UnauthorizedError(
      "Invalid authentication token"
    );
  }
};

export default authMiddleware;