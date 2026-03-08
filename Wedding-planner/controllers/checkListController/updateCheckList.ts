import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Checklist from '../../models/ChecklistModel';
import Wedding from '../../models/weddingModel';

const updateCheckList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { id } = req.params;
    const updateData = req.body;

    // First get the checklist item to find the wedding
    const checklistItem = await Checklist.findById(id);
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
      return res.status(403).json({ message: "You don't have permission to update checklist items for this wedding" });
    }

    const updated = await Checklist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Checklist item not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating checklist item:', err);
    res.status(400).json({ message: err.message });
  }
};

export default updateCheckList; 