import { Response } from "express";
import { AuthenticatedRequest } from "../../src/middleware/authenticateJWT";
import Wedding from "../../models/weddingModel";

const createWedding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🚀 createWedding called');
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    console.log('🔄 Creating new wedding with data:', JSON.stringify(req.body, null, 2));
    console.log('🍽️ Meal pricing in request:', JSON.stringify(req.body.mealPricing, null, 2));
    
    const {
      weddingName,
      weddingDate,
      startTime,
      location,
      addressDetails,
      budget,
      notes,
      status,
      participants = [],
      mealPricing,
    } = req.body;

    const newWeddingData = {
      weddingName,
      weddingDate,
      startTime,
      location,
      addressDetails,
      budget,
      notes,
      status,
      ownerID: currentUserId,
      participants: [...participants, currentUserId],
      mealPricing,
    };

    console.log('📝 Creating wedding with data:', JSON.stringify(newWeddingData, null, 2));
    console.log('🍽️ Meal pricing in newWeddingData:', JSON.stringify(newWeddingData.mealPricing, null, 2));
    
    const newWedding = await Wedding.create(newWeddingData);
    console.log('✅ Wedding created successfully:', JSON.stringify(newWedding, null, 2));
    console.log('🍽️ Meal pricing in created wedding:', JSON.stringify(newWedding.mealPricing, null, 2));
    res.status(201).json(newWedding);
  } catch (err: any) {
    console.error('❌ Error creating wedding:', err);
    res.status(400).json({ message: err.message });
  }
};

export default createWedding;
