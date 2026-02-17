import { Request, Response } from "express";
import { ProductPricing } from "../models/ProductPricing";

// GET all product pricing configurations
export const getAllPricing = async (req: Request, res: Response) => {
    try {
        const pricing = await ProductPricing.find();

        res.json({
            success: true,
            count: pricing.length,
            pricing
        });
    } catch (error) {
        console.error("Failed to fetch pricing:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pricing"
        });
    }
};

// GET pricing by product type (public endpoint for frontend)
export const getPricingByType = async (req: Request, res: Response) => {
    try {
        const { type } = req.params; // 'phone-case' or 't-shirt'

        const pricing = await ProductPricing.findOne({
            productType: type,
            isActive: true
        });

        if (!pricing) {
            return res.status(404).json({
                success: false,
                message: `Pricing not found for ${type}`
            });
        }

        res.json({
            success: true,
            pricing
        });
    } catch (error) {
        console.error("Failed to fetch pricing:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pricing"
        });
    }
};

// CREATE or UPDATE phone case pricing (Admin only)
export const setPhoneCasePricing = async (req: Request, res: Response) => {
    try {
        const { basePrice } = req.body;

        if (!basePrice || basePrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid base price is required"
            });
        }

        const pricing = await ProductPricing.findOneAndUpdate(
            { productType: 'phone-case' },
            {
                productType: 'phone-case',
                basePrice,
                isActive: true
            },
            {
                new: true,
                upsert: true // Create if doesn't exist
            }
        );

        res.json({
            success: true,
            message: "Phone case pricing updated successfully",
            pricing
        });
    } catch (error) {
        console.error("Failed to update phone case pricing:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update phone case pricing"
        });
    }
};

// CREATE or UPDATE t-shirt pricing (Admin only)
export const setTShirtPricing = async (req: Request, res: Response) => {
    try {
        const { tshirtTypes } = req.body;

        if (!tshirtTypes || !Array.isArray(tshirtTypes) || tshirtTypes.length === 0) {
            return res.status(400).json({
                success: false,
                message: "T-shirt types array is required"
            });
        }

        // Validate each t-shirt type
        for (const type of tshirtTypes) {
            if (!type.id || !type.name || !type.price || type.price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each t-shirt type must have id, name, and valid price"
                });
            }
        }

        const pricing = await ProductPricing.findOneAndUpdate(
            { productType: 't-shirt' },
            {
                productType: 't-shirt',
                tshirtTypes,
                isActive: true
            },
            {
                new: true,
                upsert: true
            }
        );

        res.json({
            success: true,
            message: "T-shirt pricing updated successfully",
            pricing
        });
    } catch (error) {
        console.error("Failed to update t-shirt pricing:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update t-shirt pricing"
        });
    }
};

// DELETE pricing configuration (Admin only)
export const deletePricing = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;

        const pricing = await ProductPricing.findOneAndDelete({ productType: type });

        if (!pricing) {
            return res.status(404).json({
                success: false,
                message: `Pricing not found for ${type}`
            });
        }

        res.json({
            success: true,
            message: "Pricing deleted successfully"
        });
    } catch (error) {
        console.error("Failed to delete pricing:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete pricing"
        });
    }
};

// Initialize default pricing (can be called once to set up defaults)
export const initializeDefaultPricing = async (req: Request, res: Response) => {
    try {
        // Phone case default
        await ProductPricing.findOneAndUpdate(
            { productType: 'phone-case' },
            {
                productType: 'phone-case',
                basePrice: 499,
                isActive: true
            },
            { upsert: true, new: true }
        );

        // T-shirt defaults
        await ProductPricing.findOneAndUpdate(
            { productType: 't-shirt' },
            {
                productType: 't-shirt',
                tshirtTypes: [
                    { id: 'half-sleeve', name: 'Rounded Neck (Half Sleeve)', price: 599 },
                    { id: 'v-neck', name: 'V-Neck T-Shirt', price: 649 },
                    { id: 'polo', name: 'Polo T-Shirt', price: 799 },
                    { id: 'full-sleeve', name: 'Full Sleeve T-Shirt', price: 699 },
                    { id: 'oversized', name: 'Oversized T-Shirt', price: 749 },
                    { id: 'sweatshirt', name: 'Sweatshirt', price: 999 }
                ],
                isActive: true
            },
            { upsert: true, new: true }
        );

        const allPricing = await ProductPricing.find();

        res.json({
            success: true,
            message: "Default pricing initialized successfully",
            pricing: allPricing
        });
    } catch (error) {
        console.error("Failed to initialize pricing:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize pricing"
        });
    }
};
