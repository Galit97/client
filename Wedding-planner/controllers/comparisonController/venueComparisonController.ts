import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import VenueComparison from '../../models/venueComparisonModel';
import Wedding from '../../models/weddingModel';
import mongoose from 'mongoose';

// Get venue comparisons for a wedding
export const getVenueComparisons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      console.error('Get venue comparisons: No user ID found');
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingID } = req.params;

    // Validate weddingID format
    if (!mongoose.Types.ObjectId.isValid(weddingID)) {
      console.error('Get venue comparisons: Invalid wedding ID format:', weddingID);
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
      console.error('Get venue comparisons: User has no access to wedding:', { currentUserId, weddingID });
      return res.status(403).json({ message: "You don't have permission to access this wedding's comparisons" });
    }

    const comparison = await VenueComparison.findOne({ weddingID });
    
    if (!comparison) {
      return res.json({ venues: [], guestCounts: { guestCount: 100, adultGuests: 80, childGuests: 20 } });
    }

    const response = {
      venues: comparison.venues,
      guestCounts: comparison.guestCounts
    };
    
    res.json(response);
  } catch (err: any) {
    console.error('Error getting venue comparisons:', err);
    res.status(500).json({ message: err.message });
  }
};

// Save venue comparisons
export const saveVenueComparisons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      console.error('Save venue comparisons: No user ID found');
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { weddingID, venues, guestCounts } = req.body;

    // Validate weddingID format
    if (!mongoose.Types.ObjectId.isValid(weddingID)) {
      console.error('Save venue comparisons: Invalid wedding ID format:', weddingID);
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
      console.error('Save venue comparisons: User has no access to wedding:', { currentUserId, weddingID });
      return res.status(403).json({ message: "You don't have permission to save comparisons for this wedding" });
    }

    // Upsert venue comparisons
    await VenueComparison.findOneAndUpdate(
      { weddingID },
      { venues, guestCounts },
      { upsert: true, new: true }
    );

    res.json({ message: "Venue comparisons saved successfully" });
  } catch (err: any) {
    console.error('Error saving venue comparisons:', err);
    res.status(500).json({ message: err.message });
  }
}; 