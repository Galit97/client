"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChecklistModel_1 = __importDefault(require("../../models/ChecklistModel"));
const updateCheckList = async (req, res) => {
    try {
        const updated = await ChecklistModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated)
            return res.status(404).json({ message: 'CheckList not found' });
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.default = updateCheckList;
