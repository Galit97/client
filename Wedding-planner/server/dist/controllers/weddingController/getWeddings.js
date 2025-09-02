"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const getWeddings = async (_req, res) => {
    try {
        const wedding = await weddingModel_1.default.find();
        res.json(wedding);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.default = getWeddings;
