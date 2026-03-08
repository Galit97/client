import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Guest from '../../models/guestModel';
import Wedding from '../../models/weddingModel';

const createGuest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const { 
      weddingID, 
      firstName, 
      lastName, 
      phone, 
      email,
      seatsReserved, 
      tableNumber,
      dietaryRestrictions,
      group,
      side,
      notes
    } = req.body;

    // Validate that the wedding belongs to the current user
    const wedding = await Wedding.findOne({ 
      _id: weddingID, 
      $or: [
        { ownerID: currentUserId },
        { participants: currentUserId }
      ]
    });

    if (!wedding) {
      return res.status(403).json({ message: "You don't have permission to add guests to this wedding" });
    }

    const newGuest = await Guest.create({
      weddingID,
      firstName,
      lastName,
      phone,
      email,
      seatsReserved,
      tableNumber,
      dietaryRestrictions: dietaryRestrictions || 'רגיל',
      group,
      side: side || 'shared',
      notes,
      status: 'Invited',
      invitationSent: false
    });

    res.status(201).json(newGuest);
  } catch (err: any) {
    console.error('Error creating guest:', err);
    res.status(400).json({ message: err.message });
  }
};

export default createGuest;