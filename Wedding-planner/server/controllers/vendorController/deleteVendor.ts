import { Request, Response } from 'express';
import Vendor from '../../models/vendorModel';

const deleteVendor = async (req: Request, res: Response) => {
  try {
    const deleted = await Vendor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ message: 'Vendor deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default deleteVendor;
