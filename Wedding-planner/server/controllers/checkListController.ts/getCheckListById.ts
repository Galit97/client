import { Request, Response } from 'express';
import CheckList from '../../models/ChecklistModel';

const getCheckListById = async (req: Request, res: Response) => {
  try {
    const checkList = await CheckList.findById(req.params.id);
    if (!checkList) return res.status(404).json({ message: 'CheckList not found' });
    res.json(checkList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getCheckListById;
