"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const guestModel_1 = __importDefault(require("../../models/guestModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const deleteGuest = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { id } = req.params;
        // First get the guest to find the wedding
        const guest = await guestModel_1.default.findById(id);
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        // Validate that the wedding belongs to the current user
        const wedding = await weddingModel_1.default.findOne({
            _id: guest.weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(403).json({ message: "You don't have permission to delete guests for this wedding" });
        }
        const deleted = await guestModel_1.default.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        res.json({ message: 'Guest deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting guest:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = deleteGuest;
