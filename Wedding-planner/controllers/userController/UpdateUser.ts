import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/userModel';

const updateUser = async (req: Request, res: Response) => {
  try {
    const { passwordHash, ...otherFields } = req.body;
    
    // If a password is provided, hash it
    let updateData = { ...otherFields };
    if (passwordHash) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordHash, salt);
      updateData.passwordHash = hashedPassword;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    if (!updated) return res.status(404).json({ message: 'User not found' });
    
    // Don't send the password hash back in the response
    const { passwordHash: _, ...userWithoutPassword } = updated.toObject();
    res.json(userWithoutPassword);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export default updateUser;
