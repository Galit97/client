"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../models/userModel"));
const deleteUser = async (req, res) => {
    try {
        const deleted = await userModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.default = deleteUser;
