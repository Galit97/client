import { Request, Response } from 'express';
import CheckList from '../../models/ChecklistModel';

const deleteCheckList = async (req: Request, res: Response) => {
  try {
    const deleted = await CheckList.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'CheckList not found' });
    res.json({ message: 'CheckList deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default deleteCheckList;
