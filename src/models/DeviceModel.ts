import { Schema, model, Document } from "mongoose";

export interface IDeviceModel extends Document {
    type: "phone-case" | "t-shirt";
    brand: string;
    modelName: string;
    frameWidth: number;
    frameHeight: number;
    printArea: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    cameras: {
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
        borderRadius: string;
        label?: string;
        flash?: {
            x: number;
            y: number;
            size: number;
        };
    }[];
    available: boolean;
    createdAt: Date;
}

const deviceModelSchema = new Schema<IDeviceModel>(
    {
        type: { type: String, enum: ["phone-case", "t-shirt"], required: true },
        brand: { type: String, required: true },
        modelName: { type: String, required: true },
        frameWidth: { type: Number, required: true },
        frameHeight: { type: Number, required: true },
        printArea: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true },
        },
        cameras: [
            {
                type: { type: String },
                x: { type: Number },
                y: { type: Number },
                width: { type: Number },
                height: { type: Number },
                borderRadius: { type: String },
                label: { type: String },
                flash: {
                    x: { type: Number },
                    y: { type: Number },
                    size: { type: Number },
                },
            },
        ],
        available: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model<IDeviceModel>("DeviceModel", deviceModelSchema);
