"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const listSchema = new mongoose_1.Schema({
    weddingID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Wedding', required: true },
    type: { type: String, enum: ['importantThings', 'weddingDay'], required: true },
    items: [
        {
            id: { type: String, required: true },
            text: { type: String, required: true },
            done: { type: Boolean, default: false },
        },
    ],
}, { timestamps: true });
listSchema.index({ weddingID: 1, type: 1 }, { unique: true });
const ListModel = (0, mongoose_1.model)('List', listSchema);
exports.default = ListModel;
