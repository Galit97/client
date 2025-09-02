"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const venueComparisonSchema = new mongoose_1.Schema({
    weddingID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wedding',
        required: true,
        unique: true,
    },
    venues: [{
            id: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            address: String,
            phone: String,
            website: String,
            notes: String,
            whatWeLiked: String,
            whatWeDidntLike: String,
            lightingAndSound: String,
            extras: String,
            basePrice: {
                type: Number,
                default: 0,
            },
            childDiscount: {
                type: Number,
                default: 0,
            },
            childAgeLimit: {
                type: Number,
                default: 0,
            },
            bulkThreshold: {
                type: Number,
                default: 0,
            },
            bulkPrice: {
                type: Number,
                default: 0,
            },
            bulkMaxGuests: {
                type: Number,
                default: 0,
            },
            reservePrice: {
                type: Number,
                default: 0,
            },
            reserveThreshold: {
                type: Number,
                default: 0,
            },
            reserveMaxGuests: {
                type: Number,
                default: 0,
            },
            lightingAndSoundPrice: {
                type: Number,
                default: 0,
            },
            extrasPrice: {
                type: Number,
                default: 0,
            },
            pricingDates: String,
            pricingDays: String,
            totalPrice: {
                type: Number,
                default: 0,
            },
            costPerPerson: {
                type: Number,
                default: 0,
            },
        }],
    guestCounts: {
        guestCount: {
            type: Number,
            default: 100,
        },
        adultGuests: {
            type: Number,
            default: 80,
        },
        childGuests: {
            type: Number,
            default: 20,
        },
    },
}, {
    timestamps: true,
});
const VenueComparison = (0, mongoose_1.model)('VenueComparison', venueComparisonSchema);
exports.default = VenueComparison;
