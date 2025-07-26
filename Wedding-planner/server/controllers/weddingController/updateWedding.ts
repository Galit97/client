import { Request, Response } from 'express';
import Wedding from '../../models/weddingModel';

const updateWedding = async (req: Request, res: Response) => {
  try {
    const updated = await Wedding.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Wedding not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export default updateWedding;
