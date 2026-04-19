"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateJWT_1 = require("../src/middleware/authenticateJWT");
const vendorComparisonController_1 = require("../controllers/comparisonController/vendorComparisonController");
const venueComparisonController_1 = require("../controllers/comparisonController/venueComparisonController");
const router = express_1.default.Router();
// Vendor comparison routes
router.get('/vendor/:weddingID', authenticateJWT_1.authenticateJWT, vendorComparisonController_1.getVendorComparisons);
router.post('/vendor', authenticateJWT_1.authenticateJWT, vendorComparisonController_1.saveVendorComparisons);
// Venue comparison routes
router.get('/venue/:weddingID', authenticateJWT_1.authenticateJWT, venueComparisonController_1.getVenueComparisons);
router.post('/venue', authenticateJWT_1.authenticateJWT, venueComparisonController_1.saveVenueComparisons);
exports.default = router;
