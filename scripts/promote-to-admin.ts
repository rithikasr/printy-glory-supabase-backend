import dns from "dns";
// Force use of Google DNS to resolve MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../src/models/user.model";

// Explicitly load .env from the root directory relative to this script
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGODB_URI;

async function promote(email: string) {
    if (!email) {
        console.error("❌ Please provide an email: npx ts-node scripts/promote-to-admin.ts <email>");
        process.exit(1);
    }

    if (!MONGO_URI) {
        console.error("❌ MONGODB_URI not found in .env file. Please check your environment variables.");
        process.exit(1);
    }

    console.log(`📡 Connecting to MongoDB...`);
    // Log a masked version for debugging
    console.log(`🔗 URI: ${MONGO_URI.replace(/:([^@]+)@/, ":****@")}`);

    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB.");

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { role: "admin" },
            { new: true }
        );

        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
        } else {
            console.log(`👑 SUCCESS: ${user.email} is now an admin!`);
            console.log(`✨ Role: ${user.role}`);
        }
    } catch (err: any) {
        console.error("❌ Connection Error Detail:");
        console.error(err);

        if (err.code === 'ECONNREFUSED') {
            console.error("\n💡 DNS ISSUE: Using local DNS failed. Try running with 'dns.setServers' which I just added.");
        }
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected.");
    }
}

const emailArg = process.argv[2];
promote(emailArg);
