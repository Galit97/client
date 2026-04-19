"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const guestModel_1 = __importDefault(require("../../models/guestModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const createGuest = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID, firstName, lastName, phone, email, seatsReserved, tableNumber, dietaryRestrictions, group, side, notes } = req.body;
        // Validate that the wedding belongs to the current user
        const wedding = await weddingModel_1.default.findOne({
            _id: weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(403).json({ message: "You don't have permission to add guests to this wedding" });
        }
        const newGuest = await guestModel_1.default.create({
            weddingID,
            firstName,
            lastName,
            phone,
            email,
            seatsReserved,
            tableNumber,
            dietaryRestrictions: dietaryRestrictions || 'רגיל',
            group,
            side: side || 'shared',
            notes,
            status: 'Invited',
            invitationSent: false
        });
        res.status(201).json(newGuest);
    }
    catch (err) {
        console.error('Error creating guest:', err);
        res.status(400).json({ message: err.message });
    }
};
exports.default = createGuest;
