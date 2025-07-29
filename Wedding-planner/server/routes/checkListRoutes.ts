import { Router } from "express";
import { authenticateJWT } from "../src/middleware/authenticateJWT";
import createCheckList from "../controllers/checkListController/createCheckList";
import getCheckListItems from "../controllers/checkListController.ts/getCheckListItems";
import getCheckListById from "../controllers/checkListController.ts/getCheckListById";
import updateCheckList from "../controllers/checkListController/updateCheckList";
import deleteCheckList from "../controllers/checkListController/deleteCheckList";
import getCheckListByWedding from "../controllers/checkListController/getCheckListByWedding";

const router = Router();

// Apply authentication to all checklist routes
router.use(authenticateJWT);

router.post("/", createCheckList);
router.get("/", getCheckListItems);
router.get("/wedding/:weddingId", getCheckListByWedding);
router.get("/:id", getCheckListById);
router.put("/:id", updateCheckList);
router.delete("/:id", deleteCheckList);

export default router;
