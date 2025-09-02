"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const weddingSchema = new mongoose_1.Schema({
    ownerID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    weddingDate: {
        type: Date,
        required: true,
    },
    coupleName: {
        type: String,
        trim: true,
    },
    startTime: {
        type: String,
    },
    location: {
        type: String,
        trim: true,
    },
    addressDetails: {
        type: String,
        trim: true,
    },
    budget: {
        type: Number,
    },
    notes: {
        type: String,
        trim: true,
    },
    weddingImage: {
        type: String,
    },
    guestCountExpected: {
        type: Number,
        default: 0,
    },
    guestCountConfirmed: {
        type: Number,
        default: 0,
    },
    vendorsCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Planning', 'Confirmed', 'Cancelled', 'Finished'],
        default: 'Planning',
    },
    weddingName: {
        type: String,
        trim: true,
    },
    checklist: [
        {
            type: String,
            trim: true,
        },
    ],
    currency: {
        type: String,
        default: 'USD',
    },
    guestList: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Guest',
        },
    ],
    actualCost: {
        type: Number,
        default: 0,
    },
    budgetBreakdown: {
        type: Map,
        of: Number,
        default: {},
    },
    budgetSettings: {
        guestsMin: { type: Number, default: 50 },
        guestsMax: { type: Number, default: 150 },
        guestsExact: { type: Number },
        giftAvg: { type: Number, default: 500 },
        savePercent: { type: Number, default: 10 },
        budgetMode: { type: String, default: 'ניצמד' },
        personalPocket: { type: Number, default: 50000 },
        totalBudget: { type: Number, default: 0 }
    },
    mealPricing: {
        basePrice: {
            type: Number,
            default: 0,
        },
        childDiscount: {
            type: Number,
            default: 50,
        },
        childAgeLimit: {
            type: Number,
            default: 12,
        },
        bulkThreshold: {
            type: Number,
            default: 250,
        },
        bulkPrice: {
            type: Number,
            default: 0,
        },
        reservePrice: {
            type: Number,
            default: 0,
        },
        reserveThreshold: {
            type: Number,
            default: 300,
        },
        bulkMaxGuests: {
            type: Number,
            default: 300,
        },
        reserveMaxGuests: {
            type: Number,
            default: 500,
        },
    },
    invites: [
        {
            token: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            expiresAt: { type: Date },
            usedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            usedAt: { type: Date },
            revoked: { type: Boolean, default: false },
        },
    ],
}, {
    timestamps: true,
});
const Wedding = (0, mongoose_1.model)('Wedding', weddingSchema);
exports.default = Wedding;
