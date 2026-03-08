import { Router } from 'express';
import { authenticateJWT } from '../src/middleware/authenticateJWT';
import ListModel from '../models/ListModel';

const router = Router();
router.use(authenticateJWT);

// Get list by type for current user's wedding
router.get('/:type', async (req: any, res) => {
  try {
    const userId = req.user?._id;
    const type = req.params.type;
    // Find wedding for owner or participant
    const Wedding = (await import('../models/weddingModel')).default as any;
    const wedding = await Wedding.findOne({ $or: [{ ownerID: userId }, { participants: userId }] });
    if (!wedding) return res.json({ items: [] });
    let doc = await ListModel.findOne({ weddingID: wedding._id, type });
    if (!doc) {
      doc = await ListModel.create({ weddingID: wedding._id, type, items: [] });
    }
    res.json(doc);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// Upsert items for type
router.put('/:type', async (req: any, res) => {
  try {
    const userId = req.user?._id;
    const type = req.params.type;
    const items = req.body.items || [];
    const Wedding = (await import('../models/weddingModel')).default as any;
    const wedding = await Wedding.findOne({ $or: [{ ownerID: userId }, { participants: userId }] });
    if (!wedding) return res.status(404).json({ message: 'Wedding not found' });
    const doc = await ListModel.findOneAndUpdate(
      { weddingID: wedding._id, type },
      { $set: { items } },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

