import { Request, Response } from 'express';
import CheckList from '../../models/ChecklistModel';

const createCheckList = async (req: Request, res: Response) => {
  try {
    const newCheckList = await CheckList.create(req.body);
    res.status(201).json(newCheckList);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export default createCheckList;