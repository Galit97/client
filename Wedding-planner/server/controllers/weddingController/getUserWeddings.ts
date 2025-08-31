import { Response } from "express";
import { AuthenticatedRequest } from "../../src/middleware/authenticateJWT";
import Wedding from "../../models/weddingModel";
import User from "../../models/userModel";

const getUserWeddings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    // Get all weddings where user is either owner or participant
    const weddings = await Wedding.find({
      $or: [
        { ownerID: userId },
        { participants: userId }
      ]
    }).populate('participants', 'firstName lastName role')
      .populate('ownerID', 'firstName lastName')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Transform the data to include user's role in each wedding
    const weddingsWithRole = weddings.map(wedding => {
      const isOwner = wedding.ownerID.toString() === userId;
      const role = isOwner ? 'owner' : 'participant';
      
      return {
        ...wedding.toObject(),
        userRole: role,
        canDelete: isOwner // Only owner can delete
      };
    });
    
    res.json(weddingsWithRole);
  } catch (err: any) {
    console.error('❌ Error fetching user weddings:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getUserWeddings; 