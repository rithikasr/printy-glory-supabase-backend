import mongoose from "mongoose";

const phoneModelRequestSchema = new mongoose.Schema(
    {
        brand: {
            type: String,
            required: true,
            trim: true
        },
        model: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export const PhoneModelRequest = mongoose.model("PhoneModelRequest", phoneModelRequestSchema);
