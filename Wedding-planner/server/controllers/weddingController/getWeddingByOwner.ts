import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";
import User from "../../models/userModel";

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

const getWeddingByOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🚀 getWeddingByOwner called');
    const ownerID = req.user?._id;
    console.log('🔍 Fetching wedding for user ID (owner or participant):', ownerID);
    
    if (!ownerID) {
      console.log('❌ No user info found');
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    // Support both the owner and any user listed as a participant
    const wedding = await Wedding.findOne({
      $or: [
        { ownerID },
        { participants: ownerID }
      ]
    }).populate('participants', 'firstName lastName role');
    
    console.log('📋 Found wedding:', JSON.stringify(wedding, null, 2));
    console.log('🍽️ Meal pricing from database:', JSON.stringify(wedding?.mealPricing, null, 2));
    console.log('🔍 Wedding schema fields:', Object.keys(wedding?.toObject() || {}));
    console.log('🔍 Has mealPricing field:', wedding?.hasOwnProperty('mealPricing'));
    console.log('🔍 mealPricing type:', typeof wedding?.mealPricing);
    console.log('🔍 mealPricing value:', wedding?.mealPricing);
    
    if (!wedding) {
      console.log('❌ Wedding not found for owner');
      return res.status(404).json({ message: "Wedding not found for this user" });
    }
    
    // Always ensure mealPricing exists in the response
    const defaultMealPricing = {
      basePrice: 0,
      childDiscount: 50,
      childAgeLimit: 12,
      bulkThreshold: 250,
      bulkPrice: 0,
      bulkMaxGuests: 300,
      reservePrice: 0,
      reserveThreshold: 300,
      reserveMaxGuests: 500
    };
    
    // Create response object with mealPricing
    const weddingResponse = {
      ...wedding.toObject(),
      mealPricing: wedding.mealPricing || defaultMealPricing
    };
    
    console.log('🍽️ Final mealPricing in response:', JSON.stringify(weddingResponse.mealPricing, null, 2));
    console.log('✅ Returning wedding data with mealPricing');
    console.log('📦 Full response:', JSON.stringify(weddingResponse, null, 2));
    
    res.json(weddingResponse);
  } catch (err: any) {
    console.error('❌ Error fetching wedding:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getWeddingByOwner;
