"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBudgetSettings = void 0;
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const saveBudgetSettings = async (req, res) => {
    var _a;
    try {
        const { weddingID, guestsMin, guestsMax, guestsExact, giftAvg, savePercent, budgetMode, personalPocket } = req.body;
        // Extract user ID from JWT token (set by authenticateJWT middleware)
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        // Find the wedding and verify the user is the owner
        const wedding = await weddingModel_1.default.findOne({
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(404).json({ message: "No wedding found for this user" });
        }
        // Any participant can save budget settings
        if (!wedding.participants.includes(currentUserId)) {
            return res.status(403).json({ message: "רק שותפי האירוע יכולים לשמור הגדרות תקציב" });
        }
        if (!guestsMin || !guestsMax || !giftAvg || !budgetMode) {
            return res.status(400).json({ message: "Missing required budget fields" });
        }
        // Calculate total budget based on settings
        const exactGuests = guestsExact || guestsMax;
        let calculatedBudget = exactGuests * giftAvg;
        // If personal budget is selected, add it to the calculated budget
        if (budgetMode === 'כיס אישי' && personalPocket) {
            calculatedBudget += personalPocket;
        }
        // Update wedding with budget settings
        const budgetSettings = {
            guestsMin,
            guestsMax,
            guestsExact,
            giftAvg,
            savePercent: savePercent || 10,
            budgetMode,
            personalPocket: personalPocket || 50000,
            totalBudget: calculatedBudget
        };
        const updatedWedding = await weddingModel_1.default.findByIdAndUpdate(wedding._id, {
            budgetSettings,
            budget: calculatedBudget // Also update the legacy budget field
        }, { new: true, runValidators: true });
        if (!updatedWedding) {
            return res.status(500).json({ message: "Failed to save budget settings" });
        }
        res.json({
            success: true,
            budget: budgetSettings,
            calculatedBudget,
            exactGuests,
            message: "התקציב נשמר בהצלחה!"
        });
    }
    catch (error) {
        console.error("❌ Error saving budget settings:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.saveBudgetSettings = saveBudgetSettings;
