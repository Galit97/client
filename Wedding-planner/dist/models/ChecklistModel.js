"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const checklistSchema = new mongoose_1.Schema({
    weddingID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    task: {
        type: String,
        required: true,
        trim: true,
    },
    done: {
        type: Boolean,
        default: false,
    },
    relatedVendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    relatedRoleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: {
        type: String,
        trim: true,
    },
    dueDate: {
        type: Date,
    },
}, {
    timestamps: true,
});
const Checklist = (0, mongoose_1.model)('Checklist', checklistSchema);
exports.default = Checklist;
