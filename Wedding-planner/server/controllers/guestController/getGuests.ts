import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Guest from '../../models/guestModel';
import Wedding from '../../models/weddingModel';

const getGuests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    // Get user's wedding first
    const wedding = await Wedding.findOne({ 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(404).json({ message: "No wedding found for this user" });
    }

    // Get guests for this wedding
    const guests = await Guest.find({ weddingID: wedding._id }).sort({ createdAt: -1 });
    res.json(guests);
  } catch (err: any) {
    console.error('Error fetching guests:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getGuests;
