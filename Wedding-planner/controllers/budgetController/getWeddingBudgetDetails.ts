import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";
import Vendor from "../../models/vendorModel";
import Guest from "../../models/guestModel";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const getWeddingBudgetDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    const wedding = await Wedding.findOne({ ownerID: ownerId }).lean();
    if (!wedding) return res.status(404).json({ error: "Wedding not found" });

    const vendors = await Vendor.find({ weddingID: wedding._id }).lean();

    const guests = await Guest.find({ weddingID: wedding._id }).lean();

    const totalExpenses = vendors.reduce((sum, v) => sum + v.price, 0);
    const totalGuests = guests.reduce((sum, g) => sum + (g.seatsReserved || 1), 0);

    res.json({
      budget: wedding.budget || 0,
      vendors,
      guests,
      totalExpenses,
      totalGuests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
