import { Request, Response } from 'express';
import Vendor from '../../models/vendorModel';

const getVendors = async (_req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getVendors;
