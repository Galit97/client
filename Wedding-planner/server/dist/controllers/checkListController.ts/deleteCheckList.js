"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChecklistModel_1 = __importDefault(require("../../models/ChecklistModel"));
const deleteCheckList = async (req, res) => {
    try {
        const deleted = await ChecklistModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'CheckList not found' });
        res.json({ message: 'CheckList deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.default = deleteCheckList;
