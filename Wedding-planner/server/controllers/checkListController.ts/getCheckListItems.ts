import { Request, Response } from 'express';
import CheckList from '../../models/ChecklistModel';

const getCheckListItems = async (_req: Request, res: Response) => {
  try {
    const checkList = await CheckList.find();
    res.json(checkList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getCheckListItems;
