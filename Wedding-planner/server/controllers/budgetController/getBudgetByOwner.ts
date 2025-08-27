import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";

export const getBudgetByOwner = async (req: Request, res: Response) => {
  try {
    console.log('🚀 getBudgetByOwner called');
    const currentUserId = (req as any).user?._id;
    if (!currentUserId) {
      console.log('❌ No user ID found in token');
      return res.status(400).json({ message: "User ID not found in token" });
    }

    console.log('🔍 Searching for wedding for user:', currentUserId);
    const wedding = await Wedding.findOne({
      $or: [{ ownerID: currentUserId }, { participants: currentUserId }]
    });

    if (!wedding) {
      console.log('❌ No wedding found for user');
      return res.status(404).json({ message: "No wedding found for this user" });
    }

    // Check if wedding has budget settings
    if (!wedding.budgetSettings) {
      console.log('💰 No budget settings found, returning empty budget');
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
      console.log('💰 Returning empty budget:', emptyBudget);
      return res.json(emptyBudget);
    }

    console.log('💰 Budget settings found:', wedding.budgetSettings);
    console.log('✅ Returning budget settings from wedding');
    res.json(wedding.budgetSettings);
  } catch (error: any) {
    console.error("❌ Error getting budget:", error);
    res.status(500).json({ message: error.message });
  }
};
