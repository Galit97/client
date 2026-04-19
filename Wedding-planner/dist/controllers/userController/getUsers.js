"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../models/userModel"));
const getUsers = async (_req, res) => {
    try {
        console.log('getUsers called - attempting to fetch users from database');
        const users = await userModel_1.default.find();
        console.log(`Found ${users.length} users in database`);
        res.json(users);
    }
    catch (err) {
        console.error('Error in getUsers:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = getUsers;
