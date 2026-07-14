import authService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../errors/AppError.js";
import isValidObjectId from "../utils/isValidObjectId.js";

const signup = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw AppError.ValidationError("User data is required");
  }

  const user = await authService.signup(req.body);

  return res.status(201).json({
    success: true,
    data: user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw AppError.ValidationError("Email and password are required");
  }

  const data = await authService.login({
    email,
    password,
  });

  const { user, accessToken, refreshToken } = data;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw AppError.ValidationError("Refresh token is required");
  }

  const data = await authService.refresh(refreshToken);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }
  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }
  const user = await authService.getUserById(userId);

  return res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw AppError.UnauthorizedError("User not authenticated");
  }

  const { password, ...updateData } = req.body;

  if (!password) {
    throw AppError.ValidationError("Password is required to update profile");
  }

  if (!isValidObjectId(userId)) {
    throw AppError.ValidationError("Invalid user id");
  }

  const updatedUser = await authService.updateUser(
    userId,
    password,
    updateData,
  );

  return res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

export default {
  signup,
  login,
  refresh,
  getUserById,
  updateUser,
};
