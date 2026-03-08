import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import CheckList from '../../models/ChecklistModel';
import Wedding from '../../models/weddingModel';

const getCheckListById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { id } = req.params;

    // Get the checklist item
    const checklistItem = await CheckList.findById(id);
    if (!checklistItem) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: checklistItem.weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to view this checklist item" });
    }

    res.json(checklistItem);
  } catch (err: any) {
    console.error('Error fetching checklist item by ID:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getCheckListById;
