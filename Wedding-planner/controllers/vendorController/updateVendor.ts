import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Vendor from '../../models/vendorModel';
import Wedding from '../../models/weddingModel';

const updateVendor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { id } = req.params;
    const updateData = req.body;

    // First get the vendor to find the wedding
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: vendor.weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to update vendors for this wedding" });
    }

    const updated = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating vendor:', err);
    res.status(400).json({ message: err.message });
  }
};

export default updateVendor;
