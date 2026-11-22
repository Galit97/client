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
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')} - User-Agent: ${req.get('user-agent')}`);
  next();
});

const defaultAllowedOrigins = [
  'https://client-ecru-five-45.vercel.app',
  'https://client-git-main-galits-projects-9399d19b.vercel.app',
  'https://client-94bai3xky-galits-projects-9399d19b.vercel.app',
  'http://localhost:5173',
  'https://wedi-bud.onrender.com',
  'https://wedi-bud-server.onrender.com',
];

const envAllowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_ORIGINS || '').split(','),
]
  .map((value) => value?.trim())
  .filter((value): value is string => Boolean(value))
  .map((value) => value.replace(/\/$/, ''));

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

const isAllowedOrigin = (origin?: string | null) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    // Allow current and future Vercel preview/production URLs after domain changes
    return hostname.endsWith('.vercel.app') || hostname.endsWith('.onrender.com');
  } catch {
    return false;
  }
};

// CORS configuration for production
app.use(cors({
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production' || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
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

// Handle preflight requests explicitly
app.options('*', (req: Request, res: Response) => {
  const origin = req.get('origin');

  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,X-Requested-With,Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Add error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Add 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err: any) => {
    // db.ts has already logged the category, name, code, and message.
    console.error("[server] Aborting startup because MongoDB is not reachable.");
    process.exit(1);
  });
