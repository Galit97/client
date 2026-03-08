import { Request, Response } from 'express';
import User from '../../models/userModel';

const getUsers = async (_req: Request, res: Response) => {
  try {
    console.log('getUsers called - attempting to fetch users from database');
    const users = await User.find();
    console.log(`Found ${users.length} users in database`);
    res.json(users);
  } catch (err: any) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ message: err.message });
  }
};

export default getUsers;
