import mongoose from "mongoose";

// Product pricing configuration for customizable products
const productPricingSchema = new mongoose.Schema(
    {
        // Product type: 'phone-case' or 't-shirt'
        productType: {
            type: String,
            required: true,
            enum: ['phone-case', 't-shirt'],
            unique: true
        },

        // Base price for phone cases
        basePrice: {
            type: Number,
            default: 0
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

        // Whether this pricing is active
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const ProductPricing = mongoose.model("ProductPricing", productPricingSchema);
