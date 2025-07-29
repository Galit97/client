import { Router } from "express";
import { authenticateJWT } from "../src/middleware/authenticateJWT";
import createGuest from "../controllers/guestController/createGuest";
import getGuests from "../controllers/guestController/getGuests";
import getGuestById from "../controllers/guestController/getGuestById";
import updateGuest from "../controllers/guestController/updateGuest";
import deleteGuest from "../controllers/guestController/deleteGuest";
import getGuestsByWedding from "../controllers/guestController/getGuestsByWedding";

const router = Router();

// Apply authentication to all guest routes
router.use(authenticateJWT);

router.post("/", createGuest);
router.get("/", getGuests);
router.get("/by-wedding/:weddingId", getGuestsByWedding);
router.get("/:id", getGuestById);
router.put("/:id", updateGuest);
router.delete("/:id", deleteGuest);

export default router;
