import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 4. Attach user
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message || "Invalid or expired token",
    });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Flatten roles (handles array or multiple args)
  const flatRoles = roles.flat();

  const userRole = String(req.user.role).toLowerCase();
  const allowedRoles = flatRoles.map(r => String(r).toLowerCase());

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: insufficient role",
    });
  }

  next();
};

export default authMiddleware;