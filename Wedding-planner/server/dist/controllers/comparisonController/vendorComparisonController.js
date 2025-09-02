"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVendorComparisons = exports.getVendorComparisons = void 0;
const vendorComparisonModel_1 = __importDefault(require("../../models/vendorComparisonModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get all vendor comparisons for a wedding
const getVendorComparisons = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID } = req.params;
        // Validate weddingID format
        if (!mongoose_1.default.Types.ObjectId.isValid(weddingID)) {
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
            return res.status(403).json({ message: "You don't have permission to access this wedding's comparisons" });
        }
        const comparisons = await vendorComparisonModel_1.default.find({ weddingID });
        // Convert to the format expected by the frontend
        const formattedComparisons = {};
        comparisons.forEach(comp => {
            formattedComparisons[comp.type] = comp.comparisons;
        });
        res.json(formattedComparisons);
    }
    catch (err) {
        console.error('Error getting vendor comparisons:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.getVendorComparisons = getVendorComparisons;
// Save vendor comparisons
const saveVendorComparisons = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID, comparisons } = req.body;
        // Validate weddingID format
        if (!mongoose_1.default.Types.ObjectId.isValid(weddingID)) {
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
            return res.status(403).json({ message: "You don't have permission to save comparisons for this wedding" });
        }
        // Delete existing comparisons for this wedding
        await vendorComparisonModel_1.default.deleteMany({ weddingID });
        // Save new comparisons
        const comparisonPromises = Object.entries(comparisons).map(([type, comps]) => {
            return vendorComparisonModel_1.default.create({
                weddingID,
                type,
                comparisons: comps
            });
        });
        await Promise.all(comparisonPromises);
        res.json({ message: "Vendor comparisons saved successfully" });
    }
    catch (err) {
        console.error('Error saving vendor comparisons:', err);
        res.status(500).json({ message: err.message });
    }
};
exports.saveVendorComparisons = saveVendorComparisons;
