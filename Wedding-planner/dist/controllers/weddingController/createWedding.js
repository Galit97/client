"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const createWedding = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingName, weddingDate, startTime, location, addressDetails, budget, notes, status, participants = [], mealPricing, } = req.body;
        const newWeddingData = {
            weddingName,
            weddingDate,
            startTime,
            location,
            addressDetails,
            budget,
            notes,
            status,
            ownerID: currentUserId,
            participants: [...participants, currentUserId],
            mealPricing,
        };
        const newWedding = await weddingModel_1.default.create(newWeddingData);
        res.status(201).json(newWedding);
    }
    catch (err) {
        console.error('❌ Error creating wedding:', err);
        res.status(400).json({ message: err.message });
    }
};
exports.default = createWedding;
