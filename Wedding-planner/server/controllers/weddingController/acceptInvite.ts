import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/authenticateJWT';
import Wedding from '../../models/weddingModel';

const acceptInvite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const wedding = await Wedding.findOne({ 'invites.token': token });
    if (!wedding) return res.status(404).json({ message: 'Invite not found' });

    const invite = (wedding.invites || []).find((i: any) => i.token === token);
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.revoked) return res.status(400).json({ message: 'Invite revoked' });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return res.status(400).json({ message: 'Invite expired' });
    if (invite.usedBy) return res.status(400).json({ message: 'Invite already used' });

    // Add user as participant with full permissions
    const participantIds = new Set((wedding.participants || []).map((p: any) => p.toString()));
    participantIds.add(currentUserId.toString());
    wedding.participants = Array.from(participantIds) as any;

    // mark invite used
    invite.usedBy = currentUserId as any;
    invite.usedAt = new Date();
    await wedding.save();

    res.json({ success: true, weddingId: wedding._id });
  } catch (err: any) {
    console.error('Error accepting invite:', err);
    res.status(500).json({ message: err.message });
  }
};

export default acceptInvite;

