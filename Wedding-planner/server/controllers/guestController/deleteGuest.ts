import { Request, Response } from 'express';
import Guest from '../../models/guestModel';

const deleteGuest = async (req: Request, res: Response) => {
  try {
    const deleted = await Guest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Guest not found' });
    res.json({ message: 'Guest deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default deleteGuest;
