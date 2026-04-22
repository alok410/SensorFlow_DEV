import Wallet from "../models/wallet.js";
import WalletTransaction from "../models/WalletTransaction.js";

export const rechargeWallet = async (req, res) => {
  try {
    const { amount, method = "cash" } = req.body;
    const consumerId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let wallet = await Wallet.findOne({ consumerId });

    if (!wallet) {
      wallet = new Wallet({ consumerId, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    await WalletTransaction.create({
      consumerId,
      type: "credit",
      amount,
      method,
      note: "Wallet recharge",
    });

    res.json({
      message: "Wallet recharged successfully",
      balance: wallet.balance,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===============================
   🔹 GET MY WALLET
================================*/
export const getMyWallet = async (req, res) => {
  try {
    const consumerId = req.user.id;

    let wallet = await Wallet.findOne({ consumerId });

    if (!wallet) {
      wallet = { balance: 0 };
    }

    res.json({
      balance: wallet.balance,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===============================
   🔹 GET TRANSACTIONS
================================*/
export const getMyTransactions = async (req, res) => {
  try {
    const consumerId = req.user.id;

    const transactions = await WalletTransaction.find({ consumerId })
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};