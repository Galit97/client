"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailService_1 = require("../services/emailService");
const createUser_1 = __importDefault(require("../controllers/userController/createUser"));
const getUsers_1 = __importDefault(require("../controllers/userController/getUsers"));
const getUserById_1 = __importDefault(require("../controllers/userController/getUserById"));
const UpdateUser_1 = __importDefault(require("../controllers/userController/UpdateUser"));
const deleteUser_1 = __importDefault(require("../controllers/userController/deleteUser"));
const loginUser_1 = __importDefault(require("../controllers/userController/loginUser"));
const router = (0, express_1.Router)();
// Multer configuration for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// Routes
router.post('/', upload.single('profileImage'), createUser_1.default);
router.get('/', getUsers_1.default);
router.get('/:id', getUserById_1.default);
router.put('/:id', UpdateUser_1.default);
router.delete('/:id', deleteUser_1.default);
router.post('/login', loginUser_1.default);
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
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(tempPassword, salt);
        // Update user's password
        user.passwordHash = hashedPassword;
        await user.save();
        // Send email with temporary password
        try {
            await (0, emailService_1.sendPasswordResetEmail)(email, {
                userName: `${user.firstName} ${user.lastName}`,
                resetLink: `${process.env.FRONTEND_URL || 'https://server-l5jj.onrender.com'}/reset-password`,
                tempPassword: tempPassword
            });
            res.json({
                message: 'אימייל עם סיסמה זמנית נשלח בהצלחה',
                note: 'בדוק את תיבת הדואר שלך (כולל תיקיית ספאם)'
            });
        }
        catch (emailError) {
            console.error('Email sending failed:', emailError);
            // If email fails, we can still return the password for now (not recommended for production)
            res.json({
                message: 'סיסמה זמנית נוצרה בהצלחה',
                tempPassword: tempPassword,
                note: 'שליחת האימייל נכשלה. אנא שמור את הסיסמה הזמנית ושנה אותה בהגדרות.',
                emailError: true
            });
        }
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error fixing password:', error);
        res.status(500).json({ message: 'Error fixing password', error: error.message });
    }
});
exports.default = router;
