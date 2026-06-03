import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";
import { Product } from "./models/Product";
import cloudinary from "./config/cloudinary";
import path from "path";

// Force DNS to use Google DNS servers
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const imagePath = path.join(
    "C:",
    "Users",
    "sheik",
    ".gemini",
    "antigravity",
    "brain",
    "9326359b-1db4-4d13-866d-a69f99701470",
    "custom_water_bottle_1780338620121.png"
);

const seedWaterBottle = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Connected to MongoDB");

        // Upload generated image to Cloudinary
        console.log("📤 Uploading water bottle image to Cloudinary...");
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "products",
            use_filename: true,
            unique_filename: false,
        });
        console.log("✅ Image uploaded to Cloudinary:", result.secure_url);

        // Delete any existing water bottle product to avoid duplicates
        await Product.deleteMany({ name: /water bottle/i });
        console.log("🗑️ Cleared existing water bottle products");

        // Create new water bottle product
        const newProduct = await Product.create({
            name: "Custom Water Bottle",
            description: "Customize your premium, double-walled vacuum insulated stainless steel water bottle. Keep drinks cold for 24 hours or hot for 12 hours.",
            price: 499,
            currency: "inr",
            image: result.secure_url,
            stock: 150,
            isActive: true
        });

        console.log("🍾 Custom Water Bottle product created successfully:", newProduct);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding water bottle product:", error);
        process.exit(1);
    }
};

seedWaterBottle();
