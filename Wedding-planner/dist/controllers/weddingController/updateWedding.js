"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const updateWedding = async (req, res) => {
    try {
        // Check if wedding exists before update
        const existingWedding = await weddingModel_1.default.findById(req.params.id);
        // Ensure mealPricing is included in the update
        const updateData = {
            ...req.body,
            mealPricing: req.body.mealPricing || (existingWedding === null || existingWedding === void 0 ? void 0 : existingWedding.mealPricing)
        };
        const updated = await weddingModel_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({ message: 'Wedding not found' });
        }
        // Ensure mealPricing is included in response
        const responseData = {
            ...updated.toObject(),
            mealPricing: updated.mealPricing || req.body.mealPricing
        };
        res.json(responseData);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.default = updateWedding;
