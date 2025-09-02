"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const guestSchema = new mongoose_1.Schema({
    weddingID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Invited', 'Confirmed', 'Declined', 'Arrived'],
        default: 'Invited',
    },
    seatsReserved: {
        type: Number,
        default: 1,
    },
    tableNumber: {
        type: Number,
    },
    invitationSent: {
        type: Boolean,
        default: false,
    },
    dietaryRestrictions: {
        type: String,
        enum: ['רגיל', 'צמחוני', 'טבעוני', 'ללא גלוטן', 'אחר'],
        default: 'רגיל',
    },
    group: {
        type: String,
        trim: true,
    },
    side: {
        type: String,
        enum: ['bride', 'groom', 'shared'],
        default: 'shared',
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
const Guest = (0, mongoose_1.model)('Guest', guestSchema);
exports.default = Guest;
