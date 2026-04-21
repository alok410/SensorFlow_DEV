
import Invoice from "../models/Invoice.js";
import WaterRate from "../models/WaterRate.js";


import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";

export const generateInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { consumerId, locationId, totalUsage, month } = req.body;

    // 🔹 Get rate
    const rateData = await WaterRate.findOne().sort({ updatedAt: -1 });
    if (!rateData) {
      throw new Error("Water rate not set");
    }

    const { ratePerLiter, freeTierLiters } = rateData;

    // 🔹 Calculate
    const extraUsage = Math.max(0, totalUsage - freeTierLiters);
    const amount = extraUsage * ratePerLiter;

    // 🔹 Prevent duplicate
    const existing = await Invoice.findOne({ consumerId, month });
    if (existing) {
      throw new Error("Invoice already exists");
    }

    // 🔹 Get/Create wallet
    let wallet = await Wallet.findOne({ consumerId }).session(session);
    if (!wallet) {
      wallet = await Wallet.create([{ consumerId, balance: 0 }], { session });
      wallet = wallet[0];
    }

    const beforeBalance = wallet.balance;

    // 🔹 Wallet deduction logic
    const walletUsed = Math.min(wallet.balance, amount);
    const dueAmount = amount - walletUsed;

    wallet.balance -= walletUsed;
    await wallet.save({ session });

    // 🔹 Create invoice
    const invoice = new Invoice({
      consumerId,
      locationId,
      month,
      totalUsage,
      limit: freeTierLiters,
      extraUsage,
      ratePerLiter,
      amount,

      dueAmount,

      // wallet fields
      paidFromWallet: walletUsed > 0,
      walletAmountUsed: walletUsed,
      walletBalanceBefore: beforeBalance,
      walletBalanceAfter: wallet.balance,

      // status logic
      status: dueAmount === 0 ? "paid" : "pending",
      paymentMode: walletUsed > 0 ? "wallet" : null,
      paidAt: dueAmount === 0 ? new Date() : null,
      isLocked: dueAmount === 0,
    });

    await invoice.save({ session });

    // 🔹 Log transaction
    if (walletUsed > 0) {
      await WalletTransaction.create([{
        consumerId,
        type: "debit",
        amount: walletUsed,
        method: "auto",
        note: `Invoice ${month}`,
      }], { session });
    }

    await session.commitTransaction();

    res.json({ message: "Invoice generated", data: invoice });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

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

export const getMyInvoices = async (req, res) => {
  try {
    const consumerId = req.user.userId;

    const invoices = await Invoice.find({ consumerId })
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
    invoice.paidById = req.user.userId;
    invoice.paidByName = req.user.name;
    invoice.paidAt = new Date();
    invoice.isLocked = true;
    invoice.dueAmount = 0;

    await invoice.save();

    res.json({ message: "Marked as paid", data: invoice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // 🔐 (Add signature verification here if using Razorpay)

    invoice.status = "paid";
    invoice.paymentMode = "online";
    invoice.paidByRole = "consumer";
    invoice.paidById = req.user.userId;
    invoice.paidByName = req.user.name;
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
    invoice.cancelledBy = req.user.userId;
    console.log(invoice.cancelledBy);
    
    invoice.cancelReason = reason;
    invoice.cancelledAt = new Date();

    await invoice.save();

    res.json({ message: "Invoice cancelled", data: invoice });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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