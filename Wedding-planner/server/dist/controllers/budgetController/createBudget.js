"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBudget = void 0;
const budgetModel_1 = __importDefault(require("../../models/budgetModel"));
const createBudget = async (req, res) => {
    try {
        const { ownerID, totalBudget, expenses } = req.body;
        if (!ownerID) {
            return res.status(400).json({ message: "ownerID is required" });
        }
        const budget = new budgetModel_1.default({ ownerID, totalBudget, expenses });
        await budget.save();
        res.status(201).json(budget);
    }
    catch (error) {
        console.error("❌ Error creating budget:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.createBudget = createBudget;
