import express from "express";
import {
    generateInvoice, getInvoices, getInvoiceById, getMyInvoices,
     markInvoicePaid, verifyPayment, cancelInvoice
} from "../controllers/invoice.controller.js"
import { protect } from "../middleware/auth.middleware.js";


const router = express.Router();


router.post("/generate", generateInvoice);
router.get("/", getInvoices);
router.get("/my", getMyInvoices);
router.put("/:id/pay-cash", markInvoicePaid);
router.post("/verify-payment", verifyPayment);
router.put("/:id/cancel",protect, cancelInvoice);
router.get("/:id", getInvoiceById);



export default router;