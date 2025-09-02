"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBudget = void 0;
const budgetModel_1 = __importDefault(require("../../models/budgetModel"));
const updateBudget = async (req, res) => {
    try {
        const ownerID = req.body.ownerID;
        if (!ownerID) {
            return res.status(400).json({ message: "ownerID is required in request body" });
        }
        const budgetId = req.params.id;
        const { totalBudget, expenses } = req.body;
        const budget = await budgetModel_1.default.findOneAndUpdate({ _id: budgetId, ownerID }, { totalBudget, expenses }, { new: true });
        if (!budget) {
            return res.status(404).json({ message: "Budget not found for this owner" });
        }
        res.json(budget);
    }
    catch (error) {
        console.error("❌ Error updating budget:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateBudget = updateBudget;
