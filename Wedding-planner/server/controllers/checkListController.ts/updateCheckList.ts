import { Request, Response } from 'express';
import CheckList from '../../models/ChecklistModel';

const updateCheckList = async (req: Request, res: Response) => {
  try {
    const updated = await CheckList.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'CheckList not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export default updateCheckList;
