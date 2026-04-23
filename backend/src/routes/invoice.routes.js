import express from "express";
import {
    generateInvoice, getInvoices, getInvoiceById, getMyInvoices,
     markInvoicePaid, verifyPayment, cancelInvoice,
     payFromWallet
} from "../controllers/invoice.controller.js"
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";


const router = express.Router();


router.post("/generate",
  protect,
  authorize("admin"),
  generateInvoice
);

router.get("/",
  protect,
  authorize("admin"),
  getInvoicesn 
);

router.get("/my",
  protect,
  authorize("consumer"),
  getMyInvoices
);

router.put("/:id/pay-cash",
  protect,
  authorize("secretary"),
  markInvoicePaid
);

router.post("/verify-payment",
  protect,
  authorize("consumer"),
  verifyPayment
);

router.put("/:id/cancel",
  protect,
  authorize("admin"),
  cancelInvoice
);

router.get("/:id",
  protect,
  authorize("admin", "consumer", "secretary"),
  getInvoiceById
);
router.put("/:id/pay-wallet", 
  protect,
  authorize("consumer"), 
  payFromWallet);



export default router;