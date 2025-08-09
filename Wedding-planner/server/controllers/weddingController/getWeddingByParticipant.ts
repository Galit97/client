import { Response } from "express";
import Wedding from "../../models/weddingModel";
import { AuthenticatedRequest } from "../../src/middleware/authenticateJWT";

const getWeddingByParticipant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: no user info" });
    }

    const weddings = await Wedding.find({ participants: userId });
    if (!weddings || weddings.length === 0) {
      return res.status(200).json([]);
    }

    res.json(weddings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export default getWeddingByParticipant;
