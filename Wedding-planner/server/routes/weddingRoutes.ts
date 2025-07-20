import { Router } from "express";

import createWedding from "../controllers/weddingController/createWedding";
import getWeddings from "../controllers/weddingController/getWeddings";
import getWeddingById from "../controllers/weddingController/getWeddingById";
import updateWedding from "../controllers/weddingController/updateWedding";
import deleteWedding from "../controllers/weddingController/deleteWedding";


const router = Router();

router.post("/", createWedding);
router.get("/", getWeddings);
router.get("/:id", getWeddingById);
router.put("/:id", updateWedding);
router.delete("/:id", deleteWedding);

export default router;
