import { Response } from "express";
import { AuthenticatedRequest } from "../../src/middleware/authenticateJWT";
import Wedding from "../../models/weddingModel";

const createWedding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

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

    const newWedding = await Wedding.create(newWeddingData);
    res.status(201).json(newWedding);
  } catch (err: any) {
    console.error('❌ Error creating wedding:', err);
    res.status(400).json({ message: err.message });
  }
};

export default createWedding;
