import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import { ProductPricing } from "./models/ProductPricing";

dotenv.config();

// Force DNS to use Google DNS servers
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const seedPricing = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Connected to MongoDB");

        // Clear existing pricing
        await ProductPricing.deleteMany({});
        console.log("🗑️  Cleared existing pricing data");

        // Insert phone case pricing
        const phoneCasePricing = await ProductPricing.create({
            productType: 'phone-case',
            basePrice: 499,
            isActive: true
        });
        console.log("📱 Phone case pricing created:", phoneCasePricing.basePrice);

        // Insert t-shirt pricing
        const tshirtPricing = await ProductPricing.create({
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
        });
        console.log("👕 T-shirt pricing created with", tshirtPricing.tshirtTypes.length, "types");

        // Insert water bottle pricing
        const bottlePricing = await ProductPricing.create({
            productType: 'water-bottle',
            bottleTypes: [
                { id: 'sport-750', name: 'Standard Sport Bottle (750ml)', price: 499 },
                { id: 'thermos-500', name: 'Thermos Flask (500ml)', price: 699 },
                { id: 'steel-1000', name: 'Stainless Steel Bottle (1000ml)', price: 599 },
                { id: 'glass-600', name: 'Glass Bottle with Sleeve (600ml)', price: 399 }
            ],
            isActive: true
        });
        console.log("💧 Water bottle pricing created with", bottlePricing.bottleTypes.length, "types");

        console.log("\n✅ Pricing data seeded successfully!");
        console.log("\nPhone Case Price: ₹" + phoneCasePricing.basePrice);
        console.log("\nT-Shirt Prices:");
        tshirtPricing.tshirtTypes.forEach((type: any) => {
            console.log(`  - ${type.name}: ₹${type.price}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding pricing:", error);
        process.exit(1);
    }
};

seedPricing();
