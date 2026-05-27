import express from "express";
import { searchAnimeCharacters } from "../controllers/anime.controller";

const router = express.Router();

// GET /api/anime/search?q=luffy
router.get("/search", searchAnimeCharacters);

export default router;
