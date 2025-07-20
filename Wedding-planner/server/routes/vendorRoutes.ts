import { Router } from 'express';
import createVendor from '../controllers/vendorController/createVendor';
import getVendors from '../controllers/vendorController/getVendors';
import getVendorById from '../controllers/vendorController/getVendorById';
import updateVendor from '../controllers/vendorController/updateVendor';
import deleteVendor from '../controllers/vendorController/deleteVendor';


const router = Router();

router.post('/', createVendor);

router.get('/', getVendors);

router.get('/:id', getVendorById);

router.put('/:id', updateVendor);

router.delete('/:id', deleteVendor);

export default router;
