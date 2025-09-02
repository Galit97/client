"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const acceptInvite = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { token } = req.params;
        if (!token)
            return res.status(400).json({ message: 'Missing token' });
        const wedding = await weddingModel_1.default.findOne({ 'invites.token': token });
        if (!wedding)
            return res.status(404).json({ message: 'Invite not found' });
        const invite = (wedding.invites || []).find((i) => i.token === token);
        if (!invite)
            return res.status(404).json({ message: 'Invite not found' });
        if (invite.revoked)
            return res.status(400).json({ message: 'Invite revoked' });
        if (invite.expiresAt && new Date(invite.expiresAt) < new Date())
            return res.status(400).json({ message: 'Invite expired' });
        if (invite.usedBy)
            return res.status(400).json({ message: 'Invite already used' });
        // Add user as participant with full permissions
        const participantIds = new Set((wedding.participants || []).map((p) => p.toString()));
        participantIds.add(currentUserId.toString());
        wedding.participants = Array.from(participantIds);
        // mark invite used
        invite.usedBy = currentUserId;
        invite.usedAt = new Date();
        await wedding.save();
        res.json({ success: true, weddingId: wedding._id });
    }
    catch (err) {
        console.error('Error accepting invite:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.default = acceptInvite;
