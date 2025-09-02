"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChecklistModel_1 = __importDefault(require("../../models/ChecklistModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getCheckListById = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { id } = req.params;
        // Get the checklist item
        const checklistItem = await ChecklistModel_1.default.findById(id);
        if (!checklistItem) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }
        // Validate that the wedding belongs to the current user
        const wedding = await weddingModel_1.default.findOne({
            _id: checklistItem.weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(403).json({ message: "You don't have permission to view this checklist item" });
        }
        res.json(checklistItem);
    }
    catch (err) {
        console.error('Error fetching checklist item by ID:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = getCheckListById;
