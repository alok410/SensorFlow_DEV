import express from "express";
import { sendOTP, verifyOTP } from "../controllers/auth.controller.js";
import { getMe } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 OTP AUTH
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// 👤 Get logged-in user
router.get("/me", protect, getMe);

export default router;