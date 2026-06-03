import mongoose from "mongoose";

// Product pricing configuration for customizable products
const productPricingSchema = new mongoose.Schema(
    {
        // Product type: 'phone-case', 't-shirt', or 'water-bottle'
        productType: {
            type: String,
            required: true,
            enum: ['phone-case', 't-shirt', 'water-bottle'],
            unique: true
        },

        // Base price for phone cases
        basePrice: {
            type: Number,
            default: 0
        },

        // New fields for dynamic pricing based on elements
        perElementPrice: {
            type: Number,
            default: 0
        },
        maxElementsForBasePrice: {
            type: Number,
            default: 0 // If say 3, then first 3 elements are free, 4th onwards cost perElementPrice
        },

        // T-shirt type pricing (only for t-shirt productType)
        tshirtTypes: [
            {
                id: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],

        // Water bottle type pricing (only for water-bottle productType)
        bottleTypes: [
            {
                id: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],

        // Whether this pricing is active
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const ProductPricing = mongoose.model("ProductPricing", productPricingSchema);
