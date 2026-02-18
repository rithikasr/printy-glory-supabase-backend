import express from "express";
import { upload } from "../middleware/upload";
import { Request, Response } from "express";

const router = express.Router();

router.post("/design", upload.single("image"), (req: Request, res: Response) => {
    try {
        if (!req.file || !(req.file as any).path) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // Cloudinary returns the URL in (req.file as any).path
        const imageUrl = (req.file as any).path;

        res.json({
            success: true,
            url: imageUrl,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

export default router;
