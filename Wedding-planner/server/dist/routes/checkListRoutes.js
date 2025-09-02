"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../src/middleware/authenticateJWT");
const createCheckList_1 = __importDefault(require("../controllers/checkListController/createCheckList"));
const getCheckListItems_1 = __importDefault(require("../controllers/checkListController.ts/getCheckListItems"));
const getCheckListById_1 = __importDefault(require("../controllers/checkListController.ts/getCheckListById"));
const updateCheckList_1 = __importDefault(require("../controllers/checkListController/updateCheckList"));
const deleteCheckList_1 = __importDefault(require("../controllers/checkListController/deleteCheckList"));
const getCheckListByWedding_1 = __importDefault(require("../controllers/checkListController/getCheckListByWedding"));
const router = (0, express_1.Router)();
// Apply authentication to all checklist routes
router.use(authenticateJWT_1.authenticateJWT);
router.post("/", createCheckList_1.default);
router.get("/", getCheckListItems_1.default);
router.get("/wedding/:weddingId", getCheckListByWedding_1.default);
router.get("/:id", getCheckListById_1.default);
router.put("/:id", updateCheckList_1.default);
router.delete("/:id", deleteCheckList_1.default);
exports.default = router;
