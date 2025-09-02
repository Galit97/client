"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChecklistModel_1 = __importDefault(require("../../models/ChecklistModel"));
const createCheckList = async (req, res) => {
    try {
        const newCheckList = await ChecklistModel_1.default.create(req.body);
        res.status(201).json(newCheckList);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
};
exports.default = createCheckList;
