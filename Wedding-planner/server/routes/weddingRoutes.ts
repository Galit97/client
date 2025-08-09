import { Router } from "express";

import createWedding from "../controllers/weddingController/createWedding";
import updateWedding from "../controllers/weddingController/updateWedding";
import deleteWedding from "../controllers/weddingController/deleteWedding";
import getWeddings from "../controllers/weddingController/getWeddings";
import getWeddingByParticipant from "../controllers/weddingController/getWeddingByParticipant";
import getWeddingByOwner from "../controllers/weddingController/getWeddingByOwner";
import getWeddingById from "../controllers/weddingController/getWeddingById";
import createInvite from "../controllers/weddingController/createInvite";
import acceptInvite from "../controllers/weddingController/acceptInvite";
import { authenticateJWT } from "../src/middleware/authenticateJWT";

const router = Router();

// Add logging middleware for wedding routes
router.use((req, res, next) => {
  console.log(`💒 Wedding route: ${req.method} ${req.path}`);
  next();
});

router.post("/", authenticateJWT, createWedding);
router.get("/", getWeddings);
router.get("/by-participant", authenticateJWT, getWeddingByParticipant);
router.get("/owner", authenticateJWT, getWeddingByOwner);
router.get("/:id", getWeddingById);     
router.put("/:id", updateWedding);
router.delete("/:id", deleteWedding);
router.post("/invites", authenticateJWT, createInvite);
router.post("/invites/accept/:token", authenticateJWT, acceptInvite);

export default router;
