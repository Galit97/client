"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const emailService_1 = require("../../services/emailService");
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, role, password } = req.body;
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "אימייל זה כבר נמצא בשימוש" });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        let profileImageUrl;
        if (req.file) {
            profileImageUrl = `https://server-l5jj.onrender.com/${req.file.filename}`;
        }
        const newUser = await userModel_1.default.create({
            firstName,
            lastName,
            email,
            phone,
            role,
            passwordHash,
            profileImage: profileImageUrl,
        });
        // Send welcome email
        try {
            await (0, emailService_1.sendWelcomeEmail)(email, `${firstName} ${lastName}`);
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the registration if email fails
        }
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};
exports.default = createUser;
