"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../src/middleware/authenticateJWT");
const createVendor_1 = __importDefault(require("../controllers/vendorController/createVendor"));
const getVendors_1 = __importDefault(require("../controllers/vendorController/getVendors"));
const getVendorById_1 = __importDefault(require("../controllers/vendorController/getVendorById"));
const updateVendor_1 = __importDefault(require("../controllers/vendorController/updateVendor"));
const deleteVendor_1 = __importDefault(require("../controllers/vendorController/deleteVendor"));
const router = (0, express_1.Router)();
// Apply authentication to all vendor routes
router.use(authenticateJWT_1.authenticateJWT);
router.post("/", createVendor_1.default);
router.post("/upload", (req, res) => {
    // Simple file upload endpoint - in a real implementation, you would use multer
    // and upload to cloud storage like AWS S3 or similar
    res.json({
        message: "File upload endpoint - implement with multer and cloud storage",
        fileURL: "placeholder-file-url"
    });
});
router.post("/upload-contract", (req, res) => {
    // Contract file upload endpoint - in a real implementation, you would use multer
    // and upload to cloud storage like AWS S3 or similar
    res.json({
        message: "Contract file upload endpoint - implement with multer and cloud storage",
        contractFile: "placeholder-contract-file"
    });
});
router.get("/", getVendors_1.default);
router.get("/:id", getVendorById_1.default);
router.put("/:id", updateVendor_1.default);
router.delete("/:id", deleteVendor_1.default);
exports.default = router;
