"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../src/middleware/authenticateJWT");
const createGuest_1 = __importDefault(require("../controllers/guestController/createGuest"));
const getGuests_1 = __importDefault(require("../controllers/guestController/getGuests"));
const getGuestById_1 = __importDefault(require("../controllers/guestController/getGuestById"));
const updateGuest_1 = __importDefault(require("../controllers/guestController/updateGuest"));
const deleteGuest_1 = __importDefault(require("../controllers/guestController/deleteGuest"));
const getGuestsByWedding_1 = __importDefault(require("../controllers/guestController/getGuestsByWedding"));
const router = (0, express_1.Router)();
// Apply authentication to all guest routes
router.use(authenticateJWT_1.authenticateJWT);
router.post("/", createGuest_1.default);
router.get("/", getGuests_1.default);
router.get("/by-wedding/:weddingId", getGuestsByWedding_1.default);
router.get("/:id", getGuestById_1.default);
router.put("/:id", updateGuest_1.default);
router.delete("/:id", deleteGuest_1.default);
exports.default = router;
