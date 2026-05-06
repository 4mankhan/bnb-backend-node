import jwt from "jsonwebtoken";


export const generateAccessToken = (payload) => {
  console.log("JWT ACCESS:", process.env.JWT_ACCESS_SECRET);
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "2d" });
};

export const generateRefreshToken = (payload) => {
  console.log("ACCESS SECRET:", process.env.JWT_REFRESH_SECRET);
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
