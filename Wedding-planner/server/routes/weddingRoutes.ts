import { Router } from "express";

import createWedding from "../controllers/weddingController/createWedding";
import updateWedding from "../controllers/weddingController/updateWedding";
import deleteWedding from "../controllers/weddingController/deleteWedding";
import { authenticateJWT } from "../src/middleware/authenticateJWT";
import getWeddings from "../controllers/weddingController/getWeddings";
import getWeddingByParticipant from "../controllers/weddingController/getWeddingByParticipant";
import getWeddingByOwner from "../controllers/weddingController/getWeddingByOwner";
import getWeddingById from "../controllers/weddingController/getWeddingById";

const router = Router();

router.post("/", authenticateJWT, createWedding);
router.get("/", getWeddings);
router.get("/by-participant", authenticateJWT, getWeddingByParticipant);
router.get("/owner", authenticateJWT, getWeddingByOwner);
router.get("/:id", getWeddingById);     
router.put("/:id", updateWedding);
router.delete("/:id", deleteWedding);

export default router;
