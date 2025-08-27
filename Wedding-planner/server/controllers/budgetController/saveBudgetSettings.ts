import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";

export const saveBudgetSettings = async (req: Request, res: Response) => {
  try {
    console.log('🚀 saveBudgetSettings called');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      weddingID,
      guestsMin,
      guestsMax,
      guestsExact,
      giftAvg,
      savePercent,
      budgetMode,
      personalPocket
    } = req.body;

    // Extract user ID from JWT token (set by authenticateJWT middleware)
    const currentUserId = (req as any).user?._id;
    console.log('🔍 Current user ID:', currentUserId);
    
    if (!currentUserId) {
      console.log('❌ No user ID found in token');
      return res.status(400).json({ message: "User ID not found in token" });
    }

    // Find the wedding and verify the user is the owner
    console.log('🔍 Searching for wedding...');
    const wedding = await Wedding.findOne({
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    console.log('📋 Wedding found:', wedding ? 'Yes' : 'No');
    if (wedding) {
      console.log('📋 Wedding details:', {
        _id: wedding._id,
        ownerID: wedding.ownerID,
        currentUserId: currentUserId
      });
    }

    if (!wedding) {
      console.log('❌ No wedding found for user');
      return res.status(404).json({ message: "No wedding found for this user" });
    }

    // Any participant can save budget settings
    console.log('🔍 Checking if user is participant...');
    console.log('🔍 Wedding ownerID:', wedding.ownerID.toString());
    console.log('🔍 Current user ID:', currentUserId.toString());
    console.log('🔍 Is participant:', wedding.participants.includes(currentUserId));
    
    if (!wedding.participants.includes(currentUserId)) {
      console.log('❌ User is not a participant - cannot save budget settings');
      return res.status(403).json({ message: "רק שותפי האירוע יכולים לשמור הגדרות תקציב" });
    }
    
    console.log('✅ User is a participant, proceeding with save');

    if (!guestsMin || !guestsMax || !giftAvg || !budgetMode) {
      return res.status(400).json({ message: "Missing required budget fields" });
    }

    // Calculate total budget based on settings
    const exactGuests = guestsExact || guestsMax;
    let calculatedBudget = exactGuests * giftAvg;
    
    // If personal budget is selected, add it to the calculated budget
    if (budgetMode === 'כיס אישי' && personalPocket) {
      calculatedBudget += personalPocket;
    }

    // Update wedding with budget settings
    const budgetSettings = {
      guestsMin,
      guestsMax,
      guestsExact,
      giftAvg,
      savePercent: savePercent || 10,
      budgetMode,
      personalPocket: personalPocket || 50000,
      totalBudget: calculatedBudget
    };

    console.log('💰 Budget settings to save:', budgetSettings);

    const updatedWedding = await Wedding.findByIdAndUpdate(
      wedding._id,
      { 
        budgetSettings,
        budget: calculatedBudget // Also update the legacy budget field
      },
      { new: true, runValidators: true }
    );

    if (!updatedWedding) {
      console.log('❌ Failed to update wedding');
      return res.status(500).json({ message: "Failed to save budget settings" });
    }

    console.log('✅ Budget settings saved successfully:', { 
      weddingId: updatedWedding._id, 
      totalBudget: calculatedBudget, 
      exactGuests 
    });
    
    res.json({ 
      success: true, 
      budget: budgetSettings, 
      calculatedBudget, 
      exactGuests, 
      message: "התקציב נשמר בהצלחה!" 
    });
  } catch (error: any) {
    console.error("❌ Error saving budget settings:", error);
    res.status(500).json({ message: error.message });
  }
}; 