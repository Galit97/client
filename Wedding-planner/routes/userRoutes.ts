import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from '../services/emailService';

import createUser from '../controllers/userController/createUser';
import getUsers from '../controllers/userController/getUsers';
import getUserById from '../controllers/userController/getUserById';
import updateUser from '../controllers/userController/UpdateUser';
import deleteUser from '../controllers/userController/deleteUser';
import loginUser from '../controllers/userController/loginUser';

const router = Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, 'uploads/');
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
}

interface MulterCallback {
    (error: Error | null, destination: string): void;
}

// Routes
router.post('/', upload.single('profileImage'), createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'אימייל נדרש' });
    }

    const User = require('../models/userModel').default;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא עם האימייל הזה' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8); // 8 character random password
    
    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    // Update user's password
    user.passwordHash = hashedPassword;
    await user.save();

    // Send email with temporary password
    try {
      await sendPasswordResetEmail(email, {
        userName: `${user.firstName} ${user.lastName}`,
        resetLink: `${process.env.FRONTEND_URL || 'https://server-l5jj.onrender.com'}/reset-password`,
        tempPassword: tempPassword
      });

      res.json({ 
        message: 'אימייל עם סיסמה זמנית נשלח בהצלחה',
        note: 'בדוק את תיבת הדואר שלך (כולל תיקיית ספאם)'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // If email fails, we can still return the password for now (not recommended for production)
      res.json({ 
        message: 'סיסמה זמנית נוצרה בהצלחה',
        tempPassword: tempPassword,
        note: 'שליחת האימייל נכשלה. אנא שמור את הסיסמה הזמנית ושנה אותה בהגדרות.',
        emailError: true
      });
    }

  } catch (error: any) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'שגיאה בשחזור סיסמה', error: error.message });
  }
});

// Temporary route to fix password hash
router.post('/fix-password', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const User = require('../models/userModel').default;
    
    const user = await User.findOne({ email: 'galit.liou@gmail.com' });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the password "123456"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Update the user's password hash
    user.passwordHash = hashedPassword;
    await user.save();
    
    // Test the login
    const isMatch = await bcrypt.compare('123456', hashedPassword);

    res.json({ 
      message: 'Password hash updated successfully!',
      testResult: isMatch ? 'SUCCESS' : 'FAILED'
    });

  } catch (error: any) {
    console.error('Error fixing password:', error);
    res.status(500).json({ message: 'Error fixing password', error: error.message });
  }
});

export default router;
