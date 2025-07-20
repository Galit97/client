import { Request, Response } from 'express';
import Wedding from '../../models/WeddingModel';

const createWedding = async (req: Request, res: Response) => {
  try {
    const newWedding = await Wedding.create(req.body);
    res.status(201).json(newWedding);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export default createWedding;
