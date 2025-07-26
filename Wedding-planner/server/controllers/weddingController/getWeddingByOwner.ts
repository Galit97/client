import { Request, Response } from "express";
import Wedding from "../../models/weddingModel";

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

const getWeddingByOwner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerID = req.user?._id;
    if (!ownerID) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const wedding = await Wedding.findOne({ ownerID });
    if (!wedding) {
      return res.status(404).json({ message: "Wedding not found for this user" });
    }
    res.json(wedding);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getWeddingByOwner;
