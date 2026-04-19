"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const crypto_1 = __importDefault(require("crypto"));
const createInvite = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId)
            return res.status(401).json({ message: 'Unauthorized' });
        const wedding = await weddingModel_1.default.findOne({ ownerID: currentUserId });
        if (!wedding)
            return res.status(404).json({ message: 'Wedding not found' });
        const token = crypto_1.default.randomBytes(24).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
        wedding.invites = wedding.invites || [];
        wedding.invites.push({ token, createdAt: new Date(), expiresAt, revoked: false });
        await wedding.save();
        res.json({ token, expiresAt });
    }
    catch (err) {
        console.error('Error creating invite:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = createInvite;
