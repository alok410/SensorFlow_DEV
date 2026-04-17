// src/models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 👤 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 📱 Primary Login Field
    mobile: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"],
      index: true,
    },

    // 🔐 Role
    role: {
      type: String,
      enum: ["admin", "secretary", "consumer"],
      required: true,
    },

    // 🔐 OTP System
    otp: {
      type: String, // hashed OTP
    },

    otpExpiry: {
      type: Date,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    // 📍 Optional Relations
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },

    // 💧 Consumer-only fields
    meterId: {
      type: String,
      required: function () {
        return this.role === "consumer";
      },
    },

    blockId: {
      type: String,
      required: function () {
        return this.role === "consumer";
      },
    },

    serialNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "consumer";
      },
    },

    // ✅ Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);