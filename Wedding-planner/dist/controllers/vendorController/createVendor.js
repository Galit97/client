"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendorModel_1 = __importDefault(require("../../models/vendorModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const createVendor = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { weddingID, vendorName, price, depositPaid, depositAmount, notes, contractFile, fileURL, status, type, phone } = req.body;
        // Validate weddingID format
        if (!mongoose_1.default.Types.ObjectId.isValid(weddingID)) {
            return res.status(400).json({ message: "Invalid wedding ID format" });
        }
        // Validate that the wedding belongs to the current user
        const wedding = await weddingModel_1.default.findOne({
            _id: weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(403).json({ message: "You don't have permission to add vendors to this wedding" });
        }
        const newVendor = await vendorModel_1.default.create({
            weddingID,
            vendorName,
            price,
            depositPaid,
            depositAmount,
            notes,
            contractFile,
            fileURL,
            status,
            type,
            phone
        });
        res.status(201).json(newVendor);
    }
    catch (err) {
        console.error('Error creating vendor:', err);
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            code: err.code,
            errors: err.errors
        });
        res.status(400).json({ message: err.message });
    }
};
exports.default = createVendor;
