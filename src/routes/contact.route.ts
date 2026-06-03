import express from "express";
import {
    submitContactMessage,
    getAllContactMessages,
    updateContactMessageStatus,
} from "../controllers/contact.controller";

const router = express.Router();

// Public — submit contact form
router.post("/", submitContactMessage);

// Admin — list all messages  (auth middleware is applied in route.ts)
router.get("/messages", getAllContactMessages);

// Admin — update message status
router.patch("/messages/:id/status", updateContactMessageStatus);

export default router;
