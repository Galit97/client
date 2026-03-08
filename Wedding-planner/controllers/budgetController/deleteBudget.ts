import { Request, Response } from "express";
import Budget from "../../models/budgetModel";

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const ownerID = req.body.ownerID || req.query.ownerID;
    const budgetId = req.params.id;

    if (!ownerID) {
      return res.status(400).json({ message: "ownerID is required" });
    }

    const deleted = await Budget.findOneAndDelete({ _id: budgetId, ownerID });
    if (!deleted) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting budget:", error);
    res.status(500).json({ message: error.message });
  }
};
