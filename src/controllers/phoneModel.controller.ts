import { Request, Response } from "express";
import { PhoneModelRequest } from "../models/PhoneModelRequest";

// CREATE phone model request
export const createPhoneModelRequest = async (req: Request, res: Response) => {
    try {
        const { brand, model, email } = req.body;

        if (!brand || !model) {
            return res.status(400).json({
                success: false,
                message: "Brand and model are required"
            });
        }

        const request = await PhoneModelRequest.create({
            brand,
            model,
            email
        });

        res.status(201).json({
            success: true,
            message: "Phone model request submitted successfully",
            request
        });

    } catch (error) {
        console.error("Phone model request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit phone model request"
        });
    }
};

// GET all phone model requests (admin only)
export const getAllPhoneModelRequests = async (req: Request, res: Response) => {
    try {
        const requests = await PhoneModelRequest.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        console.error("Failed to fetch phone model requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch phone model requests"
        });
    }
};

// UPDATE phone model request status (admin only)
export const updatePhoneModelRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: pending, approved, or rejected"
            });
        }

        const request = await PhoneModelRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Phone model request not found"
            });
        }

        res.json({
            success: true,
            message: "Status updated successfully",
            request
        });
    } catch (error) {
        console.error("Failed to update phone model request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update phone model request"
        });
    }
};
