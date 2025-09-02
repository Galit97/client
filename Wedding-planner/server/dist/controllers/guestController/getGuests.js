"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const guestModel_1 = __importDefault(require("../../models/guestModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getGuests = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        // Get user's wedding first
        const wedding = await weddingModel_1.default.findOne({
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(404).json({ message: "No wedding found for this user" });
        }
        // Get guests for this wedding
        const guests = await guestModel_1.default.find({ weddingID: wedding._id }).sort({ createdAt: -1 });
        res.json(guests);
    }
    catch (err) {
        console.error('Error fetching guests:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = getGuests;
