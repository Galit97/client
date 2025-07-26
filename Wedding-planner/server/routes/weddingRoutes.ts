import { Router } from "express";

import createWedding from "../controllers/weddingController/createWedding";
import getWeddingById from "../controllers/weddingController/getWeddingByOwner";
import updateWedding from "../controllers/weddingController/updateWedding";
import deleteWedding from "../controllers/weddingController/deleteWedding";
import { authenticateJWT } from "../src/middleware/authenticateJWT";
import getWeddingByOwner from "../controllers/weddingController/getWeddings";
import getWeddings from "../controllers/weddingController/getWeddings";
import getWeddingByParticipant from "../controllers/weddingController/getWeddingByParticipant";

const router = Router();

router.post("/", authenticateJWT, createWedding);
router.get("/", getWeddings);
router.get("/owner", authenticateJWT, getWeddingByOwner);
router.get("/:id", getWeddingById);
router.put("/:id", updateWedding);
router.delete("/:id", deleteWedding);
router.get("/by-participant", authenticateJWT, getWeddingByParticipant);
export default router;
