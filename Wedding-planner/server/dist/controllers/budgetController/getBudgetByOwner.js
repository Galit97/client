"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetByOwner = void 0;
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getBudgetByOwner = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const wedding = await weddingModel_1.default.findOne({
            $or: [{ ownerID: currentUserId }, { participants: currentUserId }]
        });
        if (!wedding) {
            return res.status(404).json({ message: "No wedding found for this user" });
        }
        // Check if wedding has budget settings
        if (!wedding.budgetSettings) {
            // Return empty budget settings instead of 404
            const emptyBudget = {
                guestsMin: 50,
                guestsMax: 150,
                guestsExact: null,
                giftAvg: 500,
                savePercent: 10,
                budgetMode: 'ניצמד',
                personalPocket: 50000,
                totalBudget: 0
            };
            return res.json(emptyBudget);
        }
        res.json(wedding.budgetSettings);
    }
    catch (error) {
        console.error("❌ Error getting budget:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.getBudgetByOwner = getBudgetByOwner;
