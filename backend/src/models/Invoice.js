import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    // 🔗 RELATION
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },

    // 📅 BILLING MONTH
    month: {
      type: String, // format: "2026-04"
      required: true,
      index: true,
    },

    // 💧 USAGE + BILLING SNAPSHOT
    totalUsage: {
      type: Number,
      required: true,
    },

    limit: {
      type: Number,
      required: true,
    },

    extraUsage: {
      type: Number,
      default: 0,
    },

    ratePerLiter: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    // 💳 PAYMENT STATUS
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
      index: true,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "online", null],
      default: null,
    },

    // 👤 WHO PAID
    paidByRole: {
      type: String,
      enum: ["consumer", "secretary", null],
      default: null,
    },

    paidById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    paidByName: {
      type: String, // snapshot for history
      default: null,
    },

    // 💰 ONLINE PAYMENT DETAILS
    paymentId: {
      type: String,
      default: null,
    },

    orderId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // ❌ CANCEL CONTROL (ADMIN)
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelReason: {
      type: String,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // 🔒 LOCK AFTER PAYMENT
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 prevent duplicate invoice per user per month
invoiceSchema.index({ consumerId: 1, month: 1 }, { unique: true });

export default mongoose.model("Invoice", invoiceSchema);