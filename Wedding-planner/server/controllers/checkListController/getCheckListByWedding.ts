import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Checklist from '../../models/ChecklistModel';
import Wedding from '../../models/weddingModel';

const getCheckListByWedding = async (req: AuthenticatedRequest, res: Response) => {
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
      return res.status(403).json({ message: "You don't have permission to view checklist for this wedding" });
    }

    const checklistItems = await Checklist.find({ weddingID: weddingId }).sort({ createdAt: -1 });
    res.json(checklistItems);
  } catch (err: any) {
    console.error('Error fetching checklist by wedding:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getCheckListByWedding; 