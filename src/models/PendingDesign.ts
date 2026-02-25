import mongoose from "mongoose";

/**
 * Temporarily stores design elements between checkout creation and webhook completion.
 * Stripe metadata has a 500-char limit per key, and design elements (especially base64-encoded
 * images) can be much larger, so we store them here keyed by the Stripe session ID.
 * 
 * After the webhook processes the order, the pending design is deleted.
 */
const pendingDesignSchema = new mongoose.Schema(
    {
        stripe_session_id: { type: String, required: true, unique: true, index: true },
        design_elements: [mongoose.Schema.Types.Mixed], // [{type, content, x, y, width, height, rotation, scale, fontSize, fontFamily, color}]
    },
    { timestamps: true }
);

// Auto-delete after 24 hours in case webhook never fires
pendingDesignSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const PendingDesign = mongoose.model("PendingDesign", pendingDesignSchema);
