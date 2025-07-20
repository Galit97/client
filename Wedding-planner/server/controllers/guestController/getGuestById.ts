import { Request, Response } from 'express';
import Guest from '../../models/guestModel';

const getGuestById = async (req: Request, res: Response) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getGuestById;
