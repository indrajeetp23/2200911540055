import express from "express";
import Url from "../models/Url.js";
import { nanoid } from "nanoid";

const router = express.Router();

// 1. Create Short URL
router.post("/shorturls", async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let code = shortcode || nanoid(6);

    // Ensure shortcode uniqueness
    const existing = await Url.findOne({ shortCode: code });
    if (existing) return res.status(400).json({ error: "Shortcode already exists" });

    const expiryDate = new Date(Date.now() + validity * 60 * 1000);

    const newUrl = new Url({ originalUrl: url, shortCode: code, expiry: expiryDate });
    await newUrl.save();

    res.status(201).json({
      shortLink: `http://localhost:5000/${code}`,
      expiry: expiryDate.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2. Get Stats (must come before redirect)
router.get("/shorturls/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlDoc = await Url.findOne({ shortCode: shortcode });

    if (!urlDoc) return res.status(404).json({ error: "Not found" });

    res.json({
      originalUrl: urlDoc.originalUrl,
      createdAt: urlDoc.createdAt,
      expiry: urlDoc.expiry,
      totalClicks: urlDoc.clicks.length,
      clicks: urlDoc.clicks
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Redirect (keep this last, it’s a catch-all)
router.get("/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlDoc = await Url.findOne({ shortCode: shortcode });

    if (!urlDoc) return res.status(404).json({ error: "Shortcode not found" });
    if (urlDoc.expiry < new Date()) return res.status(410).json({ error: "Link expired" });

    // Log click
    urlDoc.clicks.push({
      referrer: req.get("Referrer") || "Direct",
      geo: req.ip || "Unknown"
    });
    await urlDoc.save();

    res.redirect(urlDoc.originalUrl);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
