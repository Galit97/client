"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendorModel_1 = __importDefault(require("../../models/vendorModel"));
const getVendorById = async (req, res) => {
    try {
        const vendor = await vendorModel_1.default.findById(req.params.id);
        if (!vendor)
            return res.status(404).json({ message: 'Vendor not found' });
        res.json(vendor);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.default = getVendorById;
