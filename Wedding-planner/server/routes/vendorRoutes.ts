import { Router } from "express";
import { authenticateJWT } from "../src/middleware/authenticateJWT";
import createVendor from "../controllers/vendorController/createVendor";
import getVendors from "../controllers/vendorController/getVendors";
import getVendorById from "../controllers/vendorController/getVendorById";
import updateVendor from "../controllers/vendorController/updateVendor";
import deleteVendor from "../controllers/vendorController/deleteVendor";

const router = Router();

// Apply authentication to all vendor routes
router.use(authenticateJWT);

router.post("/", createVendor);
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
router.get("/", getVendors);
router.get("/:id", getVendorById);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

export default router;
