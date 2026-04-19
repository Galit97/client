"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVenueComparisons = exports.getVenueComparisons = void 0;
const venueComparisonModel_1 = __importDefault(require("../../models/venueComparisonModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get venue comparisons for a wedding
const getVenueComparisons = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            console.error('Get venue comparisons: No user ID found');
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID } = req.params;
        // Validate weddingID format
        if (!mongoose_1.default.Types.ObjectId.isValid(weddingID)) {
            console.error('Get venue comparisons: Invalid wedding ID format:', weddingID);
            return res.status(400).json({ message: "Invalid wedding ID format" });
        }
        // Check if user has access to this wedding
        const wedding = await weddingModel_1.default.findOne({
            _id: weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            console.error('Get venue comparisons: User has no access to wedding:', { currentUserId, weddingID });
            return res.status(403).json({ message: "You don't have permission to access this wedding's comparisons" });
        }
        const comparison = await venueComparisonModel_1.default.findOne({ weddingID });
        if (!comparison) {
            return res.json({ venues: [], guestCounts: { guestCount: 100, adultGuests: 80, childGuests: 20 } });
        }
        const response = {
            venues: comparison.venues,
            guestCounts: comparison.guestCounts
        };
        res.json(response);
    }
    catch (err) {
        console.error('Error getting venue comparisons:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.getVenueComparisons = getVenueComparisons;
// Save venue comparisons
const saveVenueComparisons = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            console.error('Save venue comparisons: No user ID found');
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID, venues, guestCounts } = req.body;
        // Validate weddingID format
        if (!mongoose_1.default.Types.ObjectId.isValid(weddingID)) {
            console.error('Save venue comparisons: Invalid wedding ID format:', weddingID);
            return res.status(400).json({ message: "Invalid wedding ID format" });
        }
        // Check if user has access to this wedding
        const wedding = await weddingModel_1.default.findOne({
            _id: weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            console.error('Save venue comparisons: User has no access to wedding:', { currentUserId, weddingID });
            return res.status(403).json({ message: "You don't have permission to save comparisons for this wedding" });
        }
        // Upsert venue comparisons
        await venueComparisonModel_1.default.findOneAndUpdate({ weddingID }, { venues, guestCounts }, { upsert: true, new: true });
        res.json({ message: "Venue comparisons saved successfully" });
    }
    catch (err) {
        console.error('Error saving venue comparisons:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.saveVenueComparisons = saveVenueComparisons;
