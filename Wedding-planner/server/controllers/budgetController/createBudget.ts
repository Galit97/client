import { Request, Response } from "express";
import Budget from "../../models/budgetModel";

export const createBudget = async (req: Request, res: Response) => {
  try {
    // נקבל ownerID מה־body
    const { ownerID, totalBudget, expenses } = req.body;

    if (!ownerID) {
      return res.status(400).json({ message: "ownerID is required" });
    }

    const budget = new Budget({ ownerID, totalBudget, expenses });
    await budget.save();

    res.status(201).json(budget);
  } catch (error: any) {
    console.error("❌ Error creating budget:", error);
    res.status(500).json({ message: error.message });
  }
};
