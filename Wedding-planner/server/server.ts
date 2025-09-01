import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import vendorRoutes from "./routes/vendorRoutes";
import userRoutes from "./routes/userRoutes";
import guestRoutes from "./routes/guestRoutes";
import CheckListRoutes from "./routes/checkListRoutes";
import weddingRoutes from "./routes/weddingRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import listRoutes from "./routes/listRoutes";
import comparisonRoutes from "./routes/comparisonRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import path from "path";

dotenv.config();

const app: Application = express();

// Add logging middleware
app.use((req: Request, res: Response, next) => {
  next();
});

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://wedi-app.vercel.app', // Your Vercel frontend URL
        'https://wedi-icevbne50-galits-projects-9399d19b.vercel.app', // Vercel preview URL
        'http://localhost:5173', // For local development
        'https://wedding-planner-wj86.onrender.com' // for server ok
      ]
    : true, // Allow all origins in development
  credentials: true
}));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/vendors", vendorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/checklists", CheckListRoutes);
app.use("/api/weddings", weddingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/comparisons", comparisonRoutes);
app.use("/api/budgets", budgetRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: any) => {
    console.error("Failed to start server:", err);
  });
