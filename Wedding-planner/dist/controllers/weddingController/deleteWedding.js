"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const deleteWedding = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { id } = req.params;
        // Check if the wedding exists and user has permission to delete it
        const wedding = await weddingModel_1.default.findOne({
            _id: id,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(404).json({ message: 'Wedding not found or you do not have permission to delete it' });
        }
        // Only the owner can delete the wedding
        if (wedding.ownerID.toString() !== currentUserId) {
            return res.status(403).json({ message: 'Only the wedding owner can delete the wedding' });
        }
        const deleted = await weddingModel_1.default.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Wedding not found' });
        }
        res.json({ message: 'Wedding deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting wedding:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = deleteWedding;
