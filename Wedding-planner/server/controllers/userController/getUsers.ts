import { Request, Response } from 'express';
import User from '../../models/userModel';

const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getUsers;
