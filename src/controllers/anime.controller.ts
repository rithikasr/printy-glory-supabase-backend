import { Request, Response } from "express";
import https from "https";

/**
 * Search anime characters using Jikan API (Unofficial MyAnimeList API)
 */
export const searchAnimeCharacters = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q as string)}&limit=12&order_by=favorites&sort=desc`;

    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          
          if (response.statusCode === 429) {
            return res.status(429).json({ message: "Too many requests. Please try again in a few seconds." });
          }

          if (response.statusCode !== 200) {
            return res.status(response.statusCode || 500).json({ 
              message: jsonData.message || "Failed to fetch from anime API" 
            });
          }

          if (!jsonData.data) {
             return res.json({ characters: [] });
          }

          const characters = jsonData.data.map((char: any) => ({
            id: char.mal_id,
            name: char.name,
            image: char.images.webp?.image_url || char.images.jpg?.image_url,
          }));

          res.json({ characters });
        } catch (e) {
          console.error("Parse error:", e);
          res.status(500).json({ message: "Error parsing anime data" });
        }
      });
    }).on("error", (err) => {
      console.error("Request error:", err);
      res.status(500).json({ message: "Error fetching anime characters", error: err.message });
    });

  } catch (error: any) {
    console.error("Anime controller error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
