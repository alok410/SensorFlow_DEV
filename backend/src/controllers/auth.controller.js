import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import axios from "axios";

/* ================= SEND OTP ================= */
export const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = await bcrypt.hash(otp, 10);

    user.otp = hashedOTP;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    // ✅ TEST MODE
    console.log("OTP (TEST MODE):", otp);

    res.json({
      message: "OTP generated (check server log)",
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ================= VERIFY OTP ================= */
export const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(401).json({ message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isMobileVerified = true;

    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};