"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vendorComparisonSchema = new mongoose_1.Schema({
    weddingID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    comparisons: [{
            id: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            notes: String,
            phone: String,
            instagram: String,
        }],
}, {
    timestamps: true,
});
// Compound index to ensure unique type per wedding
vendorComparisonSchema.index({ weddingID: 1, type: 1 }, { unique: true });
const VendorComparison = (0, mongoose_1.model)('VendorComparison', vendorComparisonSchema);
exports.default = VendorComparison;
