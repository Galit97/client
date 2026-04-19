"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendorModel_1 = __importDefault(require("../../models/vendorModel"));
const weddingModel_1 = __importDefault(require("../../models/weddingModel"));
const updateVendor = async (req, res) => {
    var _a;
    try {
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!currentUserId) {
            return res.status(401).json({ message: "Unauthorized: no user info" });
        }
        const { id } = req.params;
        const updateData = req.body;
        // First get the vendor to find the wedding
        const vendor = await vendorModel_1.default.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        // Validate that the wedding belongs to the current user
        const wedding = await weddingModel_1.default.findOne({
            _id: vendor.weddingID,
            $or: [
                { ownerID: currentUserId },
                { participants: currentUserId }
            ]
        });
        if (!wedding) {
            return res.status(403).json({ message: "You don't have permission to update vendors for this wedding" });
        }
        const updated = await vendorModel_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(updated);
    }
    catch (err) {
        console.error('Error updating vendor:', err);
        res.status(400).json({ message: err.message });
    }
};
exports.default = updateVendor;
