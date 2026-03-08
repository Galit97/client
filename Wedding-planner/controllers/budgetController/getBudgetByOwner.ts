import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";

export const getBudgetByOwner = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?._id;
    if (!currentUserId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const wedding = await Wedding.findOne({
      $or: [{ ownerID: currentUserId }, { participants: currentUserId }]
    });

    if (!wedding) {
      return res.status(404).json({ message: "No wedding found for this user" });
    }

    // Check if wedding has budget settings
    if (!wedding.budgetSettings) {
      // Return empty budget settings instead of 404
      const emptyBudget = {
        guestsMin: 50,
        guestsMax: 150,
        guestsExact: null,
        giftAvg: 500,
        savePercent: 10,
        budgetMode: 'ניצמד',
        personalPocket: 50000,
        totalBudget: 0
      };
      return res.json(emptyBudget);
    }

    res.json(wedding.budgetSettings);
  } catch (error: any) {
    console.error("❌ Error getting budget:", error);
    res.status(500).json({ message: error.message });
  }
};
