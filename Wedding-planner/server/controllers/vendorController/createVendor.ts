import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Vendor from '../../models/vendorModel';
import Wedding from '../../models/weddingModel';
import mongoose from 'mongoose';

const createVendor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingID, vendorName, price, depositPaid, depositAmount, notes, contractFile, fileURL, status, type } = req.body;

    console.log('Creating vendor with data:', {
      weddingID,
      vendorName,
      price,
      depositPaid,
      depositAmount,
      notes,
      contractFile,
      fileURL,
      status,
      type
    });

    // Validate weddingID format
    if (!mongoose.Types.ObjectId.isValid(weddingID)) {
      return res.status(400).json({ message: "Invalid wedding ID format" });
    }

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to add vendors to this wedding" });
    }

    const newVendor = await Vendor.create({
      weddingID,
      vendorName,
      price,
      depositPaid,
      depositAmount,
      notes,
      contractFile,
      fileURL,
      status,
      type
    });

    console.log('Vendor created successfully:', newVendor);
    res.status(201).json(newVendor);
  } catch (err: any) {
    console.error('Error creating vendor:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      errors: err.errors
    });
    res.status(400).json({ message: err.message });
  }
};

export default createVendor;
