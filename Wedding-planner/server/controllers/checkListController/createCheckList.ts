import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Checklist from '../../models/ChecklistModel';
import Wedding from '../../models/weddingModel';

const createCheckList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingID, task, notes, dueDate, relatedVendorId, relatedRoleId } = req.body;

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to add checklist items to this wedding" });
    }

    const newChecklistItem = await Checklist.create({
      weddingID,
      task,
      notes,
      dueDate,
      relatedVendorId,
      relatedRoleId,
      done: false
    });

    res.status(201).json(newChecklistItem);
  } catch (err: any) {
    console.error('Error creating checklist item:', err);
    res.status(400).json({ message: err.message });
  }
};

export default createCheckList; 