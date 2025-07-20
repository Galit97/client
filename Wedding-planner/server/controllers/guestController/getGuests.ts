import { Request, Response } from 'express';
import Guest from '../../models/guestModel';

const getGuests = async (_req: Request, res: Response) => {
  try {
    const guest = await Guest.find();
    res.json(guest);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getGuests;
