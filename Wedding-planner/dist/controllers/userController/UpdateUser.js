"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const updateUser = async (req, res) => {
    try {
        const { passwordHash, ...otherFields } = req.body;
        // If a password is provided, hash it
        let updateData = { ...otherFields };
        if (passwordHash) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(passwordHash, salt);
            updateData.passwordHash = hashedPassword;
        }
        const updated = await userModel_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            return res.status(404).json({ message: 'User not found' });
        // Don't send the password hash back in the response
        const { passwordHash: _, ...userWithoutPassword } = updated.toObject();
        res.json(userWithoutPassword);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.default = updateUser;
