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

    // 📅 BILLING MONTH (format: "YYYY-MM")
    month: {
      type: String,
      required: true,
      index: true,
    },

    // 💧 USAGE SNAPSHOT
    totalUsage: {
      type: Number,
      required: true,
      min: 0,
    },

    limit: {
      type: Number,
      required: true,
      min: 0,
    },

    extraUsage: {
      type: Number,
      default: 0,
      min: 0,
    },

    ratePerLiter: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 💰 DUE (for partial payment support)
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
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
      enum: ["cash", "online", "wallet", null],
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
      type: String, // snapshot
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

    // 💼 WALLET SUPPORT
    paidFromWallet: {
      type: Boolean,
      default: false,
    },

    walletAmountUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    walletBalanceBefore: {
      type: Number,
      default: 0,
    },

    walletBalanceAfter: {
      type: Number,
      default: 0,
    },

    // ❌ CANCEL CONTROL
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

// 🚀 Prevent duplicate invoice per user per month
invoiceSchema.index({ consumerId: 1, month: 1 }, { unique: true });

// ⚡ Faster filtering
invoiceSchema.index({ status: 1 });

export default mongoose.model("Invoice", invoiceSchema);