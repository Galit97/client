import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";
import User from "../../models/userModel";

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

const getWeddingByOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerID = req.user?._id;
    
    if (!ownerID) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    // Support both the owner and any user listed as a participant
    const wedding = await Wedding.findOne({
      $or: [
        { ownerID },
        { participants: ownerID }
      ]
    }).populate('participants', 'firstName lastName role');
    
    if (!wedding) {
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
    
    res.json(weddingResponse);
  } catch (err: any) {
    console.error('❌ Error fetching wedding:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getWeddingByOwner;
