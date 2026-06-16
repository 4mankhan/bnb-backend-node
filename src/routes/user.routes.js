import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Auth routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/refresh", userController.refresh);

router.get("/profile", authMiddleware, userController.getUserById);
router.put("/update", authMiddleware, userController.updateUser);

export default router;
