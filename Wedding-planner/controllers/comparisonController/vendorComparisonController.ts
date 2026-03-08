import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import VendorComparison from '../../models/vendorComparisonModel';
import Wedding from '../../models/weddingModel';
import mongoose from 'mongoose';

// Get all vendor comparisons for a wedding
export const getVendorComparisons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingID } = req.params;

    // Validate weddingID format
    if (!mongoose.Types.ObjectId.isValid(weddingID)) {
      return res.status(400).json({ message: "Invalid wedding ID format" });
    }

    // Check if user has access to this wedding
    const wedding = await Wedding.findOne({ 
      _id: weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to access this wedding's comparisons" });
    }

    const comparisons = await VendorComparison.find({ weddingID });
    
    // Convert to the format expected by the frontend
    const formattedComparisons: Record<string, any[]> = {};
    comparisons.forEach(comp => {
      formattedComparisons[comp.type] = comp.comparisons;
    });

    res.json(formattedComparisons);
  } catch (err: any) {
    console.error('Error getting vendor comparisons:', err);
    res.status(500).json({ message: err.message });
  }
};

// Save vendor comparisons
export const saveVendorComparisons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingID, comparisons } = req.body;

    // Validate weddingID format
    if (!mongoose.Types.ObjectId.isValid(weddingID)) {
      return res.status(400).json({ message: "Invalid wedding ID format" });
    }

    // Check if user has access to this wedding
    const wedding = await Wedding.findOne({ 
      _id: weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to save comparisons for this wedding" });
    }

    // Delete existing comparisons for this wedding
    await VendorComparison.deleteMany({ weddingID });

    // Save new comparisons
    const comparisonPromises = Object.entries(comparisons).map(([type, comps]) => {
      return VendorComparison.create({
        weddingID,
        type,
        comparisons: comps
      });
    });

    await Promise.all(comparisonPromises);

    res.json({ message: "Vendor comparisons saved successfully" });
  } catch (err: any) {
    console.error('Error saving vendor comparisons:', err);
    res.status(500).json({ message: err.message });
  }
}; 