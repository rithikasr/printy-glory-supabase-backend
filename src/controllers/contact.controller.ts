import { Request, Response } from "express";
import { ContactMessage } from "../models/ContactMessage";

/**
 * POST /api/contact
 * Public — anyone can submit the contact form.
 */
export const submitContactMessage = async (req: Request, res: Response) => {
    try {
        const { name, email, message } = req.body;

        // ── Validation ───────────────────────────────────────────────
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are all required.",
            });
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // ── Save to DB ───────────────────────────────────────────────
        const contact = await ContactMessage.create({ name, email, message });

        console.log(`📩 New contact message from ${name} <${email}>`);

        return res.status(201).json({
            success: true,
            message: "Thank you! Your message has been received. We'll get back to you soon.",
            contactId: contact._id,
        });
    } catch (error: any) {
        console.error("❌ Contact form error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};

/**
 * GET /admin/contact-messages
 * Admin-only — returns all contact messages, newest first.
 */
export const getAllContactMessages = async (_req: Request, res: Response) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        return res.json({ success: true, messages });
    } catch (error: any) {
        console.error("❌ Fetch contact messages error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to fetch messages." });
    }
};

/**
 * PATCH /admin/contact-messages/:id/status
 * Admin-only — update status to "read" or "replied".
 */
export const updateContactMessageStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["new", "read", "replied"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be 'new', 'read', or 'replied'." });
        }

        const updated = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Message not found." });
        }

        return res.json({ success: true, message: updated });
    } catch (error: any) {
        console.error("❌ Update contact status error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to update status." });
    }
};
