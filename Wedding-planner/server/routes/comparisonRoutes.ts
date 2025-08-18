import express from 'express';
import { authenticateJWT } from '../src/middleware/authenticateJWT';
import { getVendorComparisons, saveVendorComparisons } from '../controllers/comparisonController/vendorComparisonController';
import { getVenueComparisons, saveVenueComparisons } from '../controllers/comparisonController/venueComparisonController';

const router = express.Router();

// Vendor comparison routes
router.get('/vendor/:weddingID', authenticateJWT, getVendorComparisons);
router.post('/vendor', authenticateJWT, saveVendorComparisons);

// Venue comparison routes
router.get('/venue/:weddingID', authenticateJWT, getVenueComparisons);
router.post('/venue', authenticateJWT, saveVenueComparisons);

export default router; 