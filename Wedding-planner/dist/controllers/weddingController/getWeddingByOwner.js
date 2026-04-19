"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getWeddingByOwner = async (req, res) => {
    var _a;
    try {
        const ownerID = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!ownerID) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        // Support both the owner and any user listed as a participant
        const wedding = await weddingModel_1.default.findOne({
            $or: [
                { ownerID },
                { participants: ownerID }
            ]
        }).populate('participants', 'firstName lastName role');
        if (!wedding) {
            return res.status(404).json({ message: "Wedding not found for this user" });
        }
        // Always ensure mealPricing exists in the response
        const defaultMealPricing = {
            basePrice: 0,
            childDiscount: 50,
            childAgeLimit: 12,
            bulkThreshold: 250,
            bulkPrice: 0,
            bulkMaxGuests: 300,
            reservePrice: 0,
            reserveThreshold: 300,
            reserveMaxGuests: 500
        };
        // Create response object with mealPricing
        const weddingResponse = {
            ...wedding.toObject(),
            mealPricing: wedding.mealPricing || defaultMealPricing
        };
        res.json(weddingResponse);
    }
    catch (err) {
        console.error('❌ Error fetching wedding:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = getWeddingByOwner;
