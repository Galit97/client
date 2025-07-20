import { Request, Response } from 'express';
import Guest from '../../models/guestModel';

const updateGuest = async (req: Request, res: Response) => {
  try {
    const updated = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Guest not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export default updateGuest;
