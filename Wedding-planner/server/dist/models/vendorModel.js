"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vendorSchema = new mongoose_1.Schema({
    weddingID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    vendorName: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    depositPaid: {
        type: Boolean,
        default: false,
    },
    depositAmount: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        trim: true,
    },
    contractFile: {
        type: String,
        trim: true,
    },
    fileURL: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Paid'],
        default: 'Pending',
    },
    type: {
        type: String,
        enum: ['music', 'food', 'photography', 'decor', 'clothes', 'makeup_hair', 'internet_orders', 'lighting_sound', 'guest_gifts', 'venue_deposit', 'bride_dress', 'groom_suit', 'shoes', 'jewelry', 'rsvp', 'design_tables', 'bride_bouquet', 'chuppah', 'flowers', 'other'],
        required: true,
    },
    phone: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
const Vendor = (0, mongoose_1.model)('Vendor', vendorSchema);
exports.default = Vendor;
