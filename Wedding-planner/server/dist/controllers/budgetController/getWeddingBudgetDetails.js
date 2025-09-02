"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeddingBudgetDetails = void 0;
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const vendorModel_1 = __importDefault(require("../../models/vendorModel"));
const guestModel_1 = __importDefault(require("../../models/guestModel"));
const getWeddingBudgetDetails = async (req, res) => {
    var _a;
    try {
        const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!ownerId)
            return res.status(401).json({ error: "Unauthorized" });
        const wedding = await weddingModel_1.default.findOne({ ownerID: ownerId }).lean();
        if (!wedding)
            return res.status(404).json({ error: "Wedding not found" });
        const vendors = await vendorModel_1.default.find({ weddingID: wedding._id }).lean();
        const guests = await guestModel_1.default.find({ weddingID: wedding._id }).lean();
        const totalExpenses = vendors.reduce((sum, v) => sum + v.price, 0);
        const totalGuests = guests.reduce((sum, g) => sum + (g.seatsReserved || 1), 0);
        res.json({
            budget: wedding.budget || 0,
            vendors,
            guests,
            totalExpenses,
            totalGuests,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getWeddingBudgetDetails = getWeddingBudgetDetails;
