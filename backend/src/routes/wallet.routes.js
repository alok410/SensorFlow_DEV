import express from "express";
import {
  rechargeWallet,
  getMyWallet,
  getMyTransactions,
} from "../controllers/wallet.controller.js";

import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/recharge", protect, rechargeWallet);
router.get("/me", protect, getMyWallet);
router.get("/transactions", protect, getMyTransactions);

export default router;