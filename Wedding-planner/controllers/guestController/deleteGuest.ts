import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Guest from '../../models/guestModel';
import Wedding from '../../models/weddingModel';

const deleteGuest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { id } = req.params;

    // First get the guest to find the wedding
    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: guest.weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to delete guests for this wedding" });
    }

    const deleted = await Guest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json({ message: 'Guest deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting guest:', err);
    res.status(500).json({ message: err.message });
  }
};

export default deleteGuest;
