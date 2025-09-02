"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: [
            'Bride',
            'Groom',
            'MotherOfBride',
            'MotherOfGroom',
            'FatherOfBride',
            'FatherOfGroom',
            'Planner',
            'Member',
            'Other'
        ],
        required: true,
        default: 'Member',
    },
    passwordHash: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
    },
}, {
    timestamps: true,
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
