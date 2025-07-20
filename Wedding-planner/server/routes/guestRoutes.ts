import { Router } from "express";
import createGuest from "../controllers/guestController/createGuest";
import getGuests from "../controllers/guestController/getGuests";
import getGuestById from "../controllers/guestController/getGuestById";
import updateGuest from "../controllers/guestController/updateGuest";
import deleteGuest from "../controllers/guestController/deleteGuest";

const router = Router();

router.post("/", createGuest);
router.get("/", getGuests);
router.get("/:id", getGuestById);
router.put("/:id", updateGuest);
router.delete("/:id", deleteGuest);

export default router;
