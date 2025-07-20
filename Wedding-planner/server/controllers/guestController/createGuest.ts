import { Request, Response } from 'express';
import Guest from '../../models/guestModel';

const createGuest = async (req: Request, res: Response) => {
  try {
    const newGuest = await Guest.create(req.body);
    res.status(201).json(newGuest);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export default createGuest;