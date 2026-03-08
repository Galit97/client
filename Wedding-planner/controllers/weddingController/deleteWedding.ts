import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Wedding from '../../models/weddingModel';

const deleteWedding = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { id } = req.params;

    // Check if the wedding exists and user has permission to delete it
    const wedding = await Wedding.findOne({
      _id: id,
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(404).json({ message: 'Wedding not found or you do not have permission to delete it' });
    }

    // Only the owner can delete the wedding
    if (wedding.ownerID.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Only the wedding owner can delete the wedding' });
    }

    const deleted = await Wedding.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Wedding not found' });
    }

    res.json({ message: 'Wedding deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting wedding:', err);
    res.status(500).json({ message: err.message });
  }
};

export default deleteWedding;
