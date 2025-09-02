"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../src/middleware/authenticateJWT");
const ListModel_1 = __importDefault(require("../models/ListModel"));
const router = (0, express_1.Router)();
router.use(authenticateJWT_1.authenticateJWT);
// Get list by type for current user's wedding
router.get('/:type', async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const type = req.params.type;
        // Find wedding for owner or participant
        const Wedding = (await Promise.resolve().then(() => __importStar(require('../models/weddingModel')))).default;
        const wedding = await Wedding.findOne({ $or: [{ ownerID: userId }, { participants: userId }] });
        if (!wedding)
            return res.json({ items: [] });
        let doc = await ListModel_1.default.findOne({ weddingID: wedding._id, type });
        if (!doc) {
            doc = await ListModel_1.default.create({ weddingID: wedding._id, type, items: [] });
        }
        res.json(doc);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
// Upsert items for type
router.put('/:type', async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const type = req.params.type;
        const items = req.body.items || [];
        const Wedding = (await Promise.resolve().then(() => __importStar(require('../models/weddingModel')))).default;
        const wedding = await Wedding.findOne({ $or: [{ ownerID: userId }, { participants: userId }] });
        if (!wedding)
            return res.status(404).json({ message: 'Wedding not found' });
        const doc = await ListModel_1.default.findOneAndUpdate({ weddingID: wedding._id, type }, { $set: { items } }, { upsert: true, new: true });
        res.json(doc);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.default = router;
