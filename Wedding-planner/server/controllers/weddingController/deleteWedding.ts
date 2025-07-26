import { Request, Response } from 'express';
import Wedding from '../../models/weddingModel';

const deleteWedding = async (req: Request, res: Response) => {
  try {
    const deleted = await Wedding.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Wedding not found' });
    res.json({ message: 'Wedding deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default deleteWedding;
