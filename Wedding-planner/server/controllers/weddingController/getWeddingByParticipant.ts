import { Response } from "express";
import Wedding from "../../models/weddingModel";
import { AuthenticatedRequest } from "../../src/middleware/authenticateJWT";

const getWeddingByParticipant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const wedding = await Wedding.findOne({ participants: userId });
    if (!wedding) {
      return res.status(404).json({ message: "Wedding not found for this user" });
    }

    res.json(wedding);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getWeddingByParticipant;
