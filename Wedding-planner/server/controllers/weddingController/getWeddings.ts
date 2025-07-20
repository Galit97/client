import { Request, Response } from 'express';
import Wedding from '../../models/WeddingModel';

const getWeddings = async (_req: Request, res: Response) => {
  try {
    const wedding = await Wedding.find();
    res.json(wedding);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getWeddings;
