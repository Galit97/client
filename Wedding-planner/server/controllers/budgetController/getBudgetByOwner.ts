import { Request, Response } from "express";
import Budget from "../../models/budgetModel";

export const getBudgetByOwner = async (req: Request, res: Response) => {
  try {
    const ownerID = req.query.ownerID as string;
    if (!ownerID) {
      return res.status(400).json({ message: "ownerID is required" });
    }

    const budget = await Budget.findOne({ ownerID });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found for this owner" });
    }

    res.json(budget);
  } catch (error: any) {
    console.error("❌ Error getting budget:", error);
    res.status(500).json({ message: error.message });
  }
};
