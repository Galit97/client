import { Request, Response } from 'express';
import Wedding from '../../models/WeddingModel';

const getWeddingById = async (req: Request, res: Response) => {
  try {
    const wedding = await Wedding.findById(req.params.id);
    if (!wedding) return res.status(404).json({ message: 'Wedding not found' });
    res.json(Wedding);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getWeddingById;
