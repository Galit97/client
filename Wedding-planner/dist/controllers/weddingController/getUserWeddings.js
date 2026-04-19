"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getUserWeddings = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        // Get all weddings where user is either owner or participant
        const weddings = await weddingModel_1.default.find({
            $or: [
                { ownerID: userId },
                { participants: userId }
            ]
        }).populate('participants', 'firstName lastName role')
            .populate('ownerID', 'firstName lastName')
            .sort({ createdAt: -1 }); // Sort by newest first
        // Transform the data to include user's role in each wedding
        const weddingsWithRole = weddings.map(wedding => {
            const isOwner = wedding.ownerID.toString() === userId;
            const role = isOwner ? 'owner' : 'participant';
            return {
                ...wedding.toObject(),
                userRole: role,
                canDelete: isOwner // Only owner can delete
            };
        });
        res.json(weddingsWithRole);
    }
    catch (err) {
        console.error('❌ Error fetching user weddings:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = getUserWeddings;
