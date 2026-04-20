import express from "express";
import {
    generateInvoice, getInvoices, getInvoiceById, getMyInvoices,
     markInvoicePaid, verifyPayment, cancelInvoice
} from "../controllers/invoice.controller.js"


const router = express.Router();


router.post("/generate", generateInvoice);
router.get("/", getInvoices);
router.get("/my", getMyInvoices);
router.put("/:id/pay-cash", markInvoicePaid);
router.post("/verify-payment", verifyPayment);
router.put("/:id/cancel", cancelInvoice);
router.get("/:id", getInvoiceById);



export default router;