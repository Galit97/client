import { Request, Response } from "express";
import Budget from "../../models/budgetModel";

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const ownerID = req.body.ownerID;
    if (!ownerID) {
      return res.status(400).json({ message: "ownerID is required in request body" });
    }

    const budgetId = req.params.id;
    const { totalBudget, expenses } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, ownerID },
      { totalBudget, expenses },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found for this owner" });
    }

    res.json(budget);
  } catch (error: any) {
    console.error("❌ Error updating budget:", error);
    res.status(500).json({ message: error.message });
  }
};
