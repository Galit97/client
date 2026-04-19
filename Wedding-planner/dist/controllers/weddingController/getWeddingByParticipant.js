"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getWeddingByParticipant = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const weddings = await weddingModel_1.default.find({ participants: userId });
        if (!weddings || weddings.length === 0) {
            return res.status(200).json([]);
        }
        res.json(weddings);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.default = getWeddingByParticipant;
