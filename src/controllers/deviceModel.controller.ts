import { Request, Response } from "express";
import DeviceModel from "../models/DeviceModel";
import { PhoneModelRequest } from "../models/PhoneModelRequest";

export const createDeviceModel = async (req: Request, res: Response) => {
    try {
        const { type, brand, modelName, frameWidth, frameHeight, printArea, cameras, requestId } = req.body;

        const newModel = await DeviceModel.create({
            type,
            brand,
            modelName,
            frameWidth,
            frameHeight,
            printArea,
            cameras,
            available: true,
        });

        // If this was created from a user request, update the request status
        if (requestId) {
            await PhoneModelRequest.findByIdAndUpdate(requestId, { status: "approved" });
        }

        res.status(201).json({ success: true, model: newModel });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating device model", error });
    }
};

export const getDeviceModels = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};
        const models = await DeviceModel.find(filter).sort({ brand: 1, modelName: 1 });
        res.json({ success: true, models });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching device models", error });
    }
};

export const updateDeviceModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedModel = await DeviceModel.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, model: updatedModel });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating device model", error });
    }
};

export const deleteDeviceModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await DeviceModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Model deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting device model", error });
    }
};
