import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import mealRoutes from "./routes/mealRoutes.js"; //janet
import userRoutes from "./routes/userRoutes.js"; //janet
import feedRoutes from "./routes/feedRoutes.js"; //janet


dotenv.config(); // ✅ Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Check if MONGO_URI is loaded
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.use("/api/users", userRoutes);//janet
app.use("/api/meals", mealRoutes);//janet
app.use("/api/feed", feedRoutes);//janet

app.get("/", (req, res) => {
  res.send("Inventory backend running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
