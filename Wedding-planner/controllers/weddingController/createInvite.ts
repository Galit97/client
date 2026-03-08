import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Wedding from '../../models/weddingModel';
import crypto from 'crypto';

const createInvite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const wedding = await Wedding.findOne({ ownerID: currentUserId });
    if (!wedding) return res.status(404).json({ message: 'Wedding not found' });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    wedding.invites = wedding.invites || [];
    wedding.invites.push({ token, createdAt: new Date(), expiresAt, revoked: false });
    await wedding.save();

    res.json({ token, expiresAt });
  } catch (err: any) {
    console.error('Error creating invite:', err);
    res.status(500).json({ message: err.message });
  }
};

export default createInvite;

