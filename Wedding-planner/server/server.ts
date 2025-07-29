import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import vendorRoutes from "./routes/vendorRoutes";
import userRoutes from "./routes/userRoutes";
import guestRoutes from "./routes/guestRoutes";
import CheckListRoutes from "./routes/checkListRoutes";
import weddingRoutes from "./routes/weddingRoutes";

dotenv.config();

const app: Application = express();

// Add logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Request body:`, JSON.stringify(req.body, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`🔍 Query params:`, JSON.stringify(req.query, null, 2));
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use('/uploads', express.static('uploads'));

app.use("/api/vendors", vendorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/checklists", CheckListRoutes);
app.use("/api/weddings", weddingRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err: any) => {
    console.error("Failed to start server:", err);
  });
