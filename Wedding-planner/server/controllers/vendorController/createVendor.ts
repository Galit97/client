import { Request, Response } from 'express';
import Vendor from '../../models/vendorModel';

const createVendor = async (req: Request, res: Response) => {
  try {
    const newVendor = await Vendor.create(req.body);
    res.status(201).json(newVendor);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

export default createVendor;
