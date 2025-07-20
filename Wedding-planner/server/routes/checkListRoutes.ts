import { Router } from "express";
import createCheckList from "../controllers/checkListController.ts/createCheckList";
import getCheckListById from "../controllers/checkListController.ts/getCheckListById";
import updateCheckList from "../controllers/checkListController.ts/updateCheckList";
import deleteCheckList from "../controllers/checkListController.ts/deleteCheckList";
import getCheckListItems from "../controllers/checkListController.ts/getCheckListItems";


const router = Router();

router.post("/", createCheckList);
router.get("/", getCheckListItems);
router.get("/:id", getCheckListById);
router.put("/:id", updateCheckList);
router.delete("/:id", deleteCheckList);

export default router;
