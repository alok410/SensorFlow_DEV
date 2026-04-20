import express from "express";
import {
    generateInvoice, getInvoices, getInvoiceById, getMyInvoices,
     markInvoicePaid, verifyPayment, cancelInvoice
} from "../controllers/invoice.controller.js"
import { protect } from "../middleware/auth.middleware.js";


const router = express.Router();


router.post("/generate",protect, generateInvoice);
router.get("/",protect, getInvoices);
router.get("/my", protect,getMyInvoices);
router.put("/:id/pay-cash",protect, markInvoicePaid);
router.post("/verify-payment", protect,verifyPayment);
router.put("/:id/cancel",protect, cancelInvoice);
router.get("/:id", protect,getInvoiceById);



export default router;