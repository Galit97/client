import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import vendorRoutes from './routes/vendorRoutes';
import userRoutes from './routes/userRoutes';
import guestRoutes from './routes/guestRoutes';
import CheckListRoutes from './routes/checkListRoutes';
import weddingRoutes from './routes/weddingRoutes';


dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());


app.use('/api/vendors', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/checklists', CheckListRoutes);
app.use('/api/weddings', weddingRoutes);

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
