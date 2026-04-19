"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createWedding_1 = __importDefault(require("../controllers/weddingController/createWedding"));
const updateWedding_1 = __importDefault(require("../controllers/weddingController/updateWedding"));
const deleteWedding_1 = __importDefault(require("../controllers/weddingController/deleteWedding"));
const getWeddings_1 = __importDefault(require("../controllers/weddingController/getWeddings"));
const getWeddingByParticipant_1 = __importDefault(require("../controllers/weddingController/getWeddingByParticipant"));
const getWeddingByOwner_1 = __importDefault(require("../controllers/weddingController/getWeddingByOwner"));
const getWeddingById_1 = __importDefault(require("../controllers/weddingController/getWeddingById"));
const createInvite_1 = __importDefault(require("../controllers/weddingController/createInvite"));
const acceptInvite_1 = __importDefault(require("../controllers/weddingController/acceptInvite"));
const authenticateJWT_1 = require("../src/middleware/authenticateJWT");
const router = (0, express_1.Router)();
// Add logging middleware for wedding routes
router.use((req, res, next) => {
    next();
});
router.post("/", authenticateJWT_1.authenticateJWT, createWedding_1.default);
router.get("/", getWeddings_1.default);
router.get("/by-participant", authenticateJWT_1.authenticateJWT, getWeddingByParticipant_1.default);
router.get("/owner", authenticateJWT_1.authenticateJWT, getWeddingByOwner_1.default);
router.get("/:id", getWeddingById_1.default);
router.put("/:id", updateWedding_1.default);
router.delete("/:id", authenticateJWT_1.authenticateJWT, deleteWedding_1.default);
router.post("/invites", authenticateJWT_1.authenticateJWT, createInvite_1.default);
router.post("/invites/accept/:token", authenticateJWT_1.authenticateJWT, acceptInvite_1.default);
exports.default = router;
