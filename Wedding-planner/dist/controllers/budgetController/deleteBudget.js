"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = void 0;
const budgetModel_1 = __importDefault(require("../../models/budgetModel"));
const deleteBudget = async (req, res) => {
    try {
        const ownerID = req.body.ownerID || req.query.ownerID;
        const budgetId = req.params.id;
        if (!ownerID) {
            return res.status(400).json({ message: "ownerID is required" });
        }
        const deleted = await budgetModel_1.default.findOneAndDelete({ _id: budgetId, ownerID });
        if (!deleted) {
            return res.status(404).json({ message: "Budget not found" });
        }
        res.json({ message: "Budget deleted successfully" });
    }
    catch (error) {
        console.error("❌ Error deleting budget:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteBudget = deleteBudget;
