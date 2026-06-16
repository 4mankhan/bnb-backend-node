import AppError from "../errors/AppError.js";

const requireRole =
  (...roles) =>
  (req, res, next) => {
    const allowedRoles = roles.map(role =>
      String(role).toLowerCase()
    );

    const userRole = String(
      req.user.role
    ).toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      throw AppError.ForbiddenError(
        "Insufficient permissions"
      );
    }

    return next();
  };

export default requireRole;