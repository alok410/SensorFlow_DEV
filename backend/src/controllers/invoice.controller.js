import Invoice from "../models/Invoice.js";
import WaterRate from "../models/WaterRate.js";
import Wallet from "../models/wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";
import mongoose from "mongoose";

/* =================================
   GENERATE INVOICE (ADMIN)
=================================*/
export const generateInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { consumerId, locationId, totalUsage, month } = req.body;

    if (!consumerId || !locationId || !totalUsage || !month) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 Get latest rate
    const rateData = await WaterRate.findOne()
      .sort({ updatedAt: -1 })
      .session(session);

    if (!rateData) {
      throw new Error("Water rate not set");
    }

    const { ratePerLiter, freeTierLiters } = rateData;

    // 🔹 Prevent duplicate
    const existing = await Invoice.findOne({ consumerId, month }).session(session);
    if (existing) {
      throw new Error("Invoice already exists");
    }

    // 🔹 Calculate
    const extraUsage = Math.max(0, totalUsage - freeTierLiters);
    const amount = extraUsage * ratePerLiter;

    // 🔹 Wallet (NO deduction here)
    let wallet = await Wallet.findOne({ consumerId }).session(session);

    if (!wallet) {
      wallet = await Wallet.create([{ consumerId, balance: 0 }], { session });
      wallet = wallet[0];
    }

    const beforeBalance = wallet.balance;

    // 🔹 Create invoice (ALWAYS pending)
    const invoice = await Invoice.create([{
      consumerId,
      locationId,
      month,
      totalUsage,
      limit: freeTierLiters,
      extraUsage,
      ratePerLiter,
      amount,

      dueAmount: amount,

      paidFromWallet: false,
      walletAmountUsed: 0,
      walletBalanceBefore: beforeBalance,
      walletBalanceAfter: beforeBalance,

      status: "pending",
      paymentMode: null,
      paidAt: null,
      isLocked: false,
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Invoice generated",
      data: invoice[0],
    });

  } catch (error) {
    await session.abortTransaction();

    if (error.code === 11000) {
      return res.status(400).json({ message: "Invoice already exists" });
    }

    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


/* =================================
   GET ALL INVOICES (ADMIN)
=================================*/
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("consumerId", "name mobile")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =================================
   GET MY INVOICES (CONSUMER)
=================================*/
export const getMyInvoices = async (req, res) => {
  try {
    const consumerId = req.user.id;

    const invoices = await Invoice.find({ consumerId })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =================================
   PAY FROM WALLET (CONSUMER)
=================================*/
export const payFromWallet = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 🔐 SECURITY
    if (invoice.consumerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    let wallet = await Wallet.findOne({ consumerId: invoice.consumerId });

    if (!wallet || wallet.balance <= 0) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const walletUsed = Math.min(wallet.balance, invoice.dueAmount);

    wallet.balance -= walletUsed;
    await wallet.save();

    // 🔹 Update invoice
    invoice.walletAmountUsed += walletUsed;
    invoice.dueAmount -= walletUsed;
    invoice.paidFromWallet = true;

    if (invoice.dueAmount === 0) {
      invoice.status = "paid";
      invoice.paymentMode = "wallet";
      invoice.paidAt = new Date();
      invoice.isLocked = true;
    }

    await invoice.save();

    // 🔹 Log transaction
    await WalletTransaction.create({
      consumerId: invoice.consumerId,
      type: "debit",
      amount: walletUsed,
      method: "wallet",
      note: `Invoice payment ${invoice.month}`,
    });

    res.json({
      message: "Paid from wallet",
      data: invoice,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =================================
   CASH PAYMENT (SECRETARY)
=================================*/
export const markInvoicePaid = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    invoice.status = "paid";
    invoice.paymentMode = "cash";
    invoice.paidByRole = "secretary";
    invoice.paidById = req.user.id;
    invoice.paidAt = new Date();
    invoice.isLocked = true;
    invoice.dueAmount = 0;

    await invoice.save();

    res.json({ message: "Marked as paid", data: invoice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =================================
   ONLINE PAYMENT VERIFY
=================================*/
export const verifyPayment = async (req, res) => {
  try {
    const { invoiceId, paymentId, orderId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    invoice.status = "paid";
    invoice.paymentMode = "online";
    invoice.paidByRole = "consumer";
    invoice.paidById = req.user.id;
    invoice.paymentId = paymentId;
    invoice.orderId = orderId;
    invoice.paidAt = new Date();
    invoice.isLocked = true;
    invoice.dueAmount = 0;

    await invoice.save();

    res.json({ message: "Payment verified", data: invoice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =================================
   CANCEL INVOICE (ADMIN)
=================================*/
export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Cannot cancel paid invoice" });
    }

    invoice.status = "cancelled";
    invoice.cancelledBy = req.user.id;
    invoice.cancelReason = reason;
    invoice.cancelledAt = new Date();

    await invoice.save();

    res.json({ message: "Invoice cancelled", data: invoice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =================================
   GET INVOICE BY ID
=================================*/
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("consumerId", "name mobile");

    if (!invoice) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(invoice);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};