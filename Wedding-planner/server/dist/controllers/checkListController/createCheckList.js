"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChecklistModel_1 = __importDefault(require("../../models/ChecklistModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const createCheckList = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID, task, notes, dueDate, relatedVendorId, relatedRoleId } = req.body;
        // Validate that the wedding belongs to the current user
        const wedding = await weddingModel_1.default.findOne({
            _id: weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(403).json({ message: "You don't have permission to add checklist items to this wedding" });
        }
        const newChecklistItem = await ChecklistModel_1.default.create({
            weddingID,
            task,
            notes,
            dueDate,
            relatedVendorId,
            relatedRoleId,
            done: false
        });
        res.status(201).json(newChecklistItem);
    }
    catch (err) {
        console.error('Error creating checklist item:', err);
        res.status(400).json({ message: err.message });
    }
};
exports.default = createCheckList;
