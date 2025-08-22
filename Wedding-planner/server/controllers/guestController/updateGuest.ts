import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Guest from '../../models/guestModel';
import Wedding from '../../models/weddingModel';

const updateGuest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("=== SERVER SIDE UPDATE DEBUG ===");
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      console.log("Unauthorized: no user info");
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { id } = req.params;
    const updateData = req.body;
    
    console.log("Updating guest ID:", id);
    console.log("Update data received:", updateData);
    console.log("Update data JSON:", JSON.stringify(updateData, null, 2));

    // First get the guest to find the wedding
    const guest = await Guest.findById(id);
    if (!guest) {
      console.log("Guest not found in DB");
      return res.status(404).json({ message: 'Guest not found' });
    }

    console.log("Original guest from DB:", guest);

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: guest.weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      console.log("Wedding permission denied");
      return res.status(403).json({ message: "You don't have permission to update guests for this wedding" });
    }

    console.log("Wedding permission granted, updating guest...");

    const updated = await Guest.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      console.log("Guest not found after update");
      return res.status(404).json({ message: 'Guest not found' });
    }

    console.log("Updated guest in DB:", updated);
    console.log("=== END SERVER SIDE UPDATE DEBUG ===");
    res.json(updated);
  } catch (err: any) {
    console.error('Error updating guest:', err);
    console.log("=== END SERVER SIDE UPDATE DEBUG ===");
    res.status(400).json({ message: err.message });
  }
};

export default updateGuest;
