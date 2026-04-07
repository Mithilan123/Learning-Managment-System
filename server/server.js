import "dotenv/config";
import express from "express";
import connectDB from "./src/config/db.js";

const app = express();
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
