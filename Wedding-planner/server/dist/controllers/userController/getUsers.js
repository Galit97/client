"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../models/userModel"));
const getUsers = async (_req, res) => {
    try {
        const users = await userModel_1.default.find();
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.default = getUsers;
