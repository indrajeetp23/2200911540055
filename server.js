import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import urlRoutes from "./routes/urlRoutes.js";
import { logger } from "./middleware/logger.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(logger);
app.get("/", (req, res) => {
    res.send("URL Shortener API is running. now go to postman to check for the  the API and create the short link");
  });
  

// Routes
app.use("/", urlRoutes);

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(` Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error(" MongoDB Connection Failed:", err));
