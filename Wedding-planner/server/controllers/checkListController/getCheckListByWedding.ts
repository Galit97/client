import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Checklist from '../../models/ChecklistModel';
import Wedding from '../../models/weddingModel';

const getCheckListByWedding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      console.log("No user ID found in request");
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingId } = req.params;
    
    console.log("Fetching checklist for wedding:", weddingId, "by user:", currentUserId);
    console.log("Request params:", req.params);
    console.log("Request headers:", req.headers);
    
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

    console.log("Wedding search result:", wedding ? "Found" : "Not found");

    if (!wedding) {
      console.log("Wedding not found or user doesn't have access");
      return res.status(403).json({ message: "You don't have permission to view checklist for this wedding" });
    }

    console.log("Wedding found, fetching checklist items...");
    const checklistItems = await Checklist.find({ weddingID: weddingId }).sort({ createdAt: -1 });
    console.log("Found checklist items:", checklistItems.length);
    console.log("Checklist data:", checklistItems);
    res.json(checklistItems);
  } catch (err: any) {
    console.error('Error fetching checklist by wedding:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getCheckListByWedding; 