import { Request, Response } from 'express';
import Vendor from '../../models/vendorModel';

const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getVendorById;
