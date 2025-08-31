import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Guest from '../../models/guestModel';
import Wedding from '../../models/weddingModel';

const getGuestsByWedding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingId } = req.params;
    
    if (!weddingId) {
      return res.status(400).json({ message: 'Wedding ID is required' });
    }

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: weddingId, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to view guests for this wedding" });
    }

    const guests = await Guest.find({ weddingID: weddingId }).sort({ createdAt: -1 });
    res.json(guests);
  } catch (err: any) {
    console.error('Error fetching guests by wedding:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getGuestsByWedding; 