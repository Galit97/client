import { Router } from "express";
import { authenticateJWT } from "../src/middleware/authenticateJWT";
import { createBudget } from "../controllers/budgetController/createBudget";
import { getBudgetByOwner } from "../controllers/budgetController/getBudgetByOwner";
import { updateBudget } from "../controllers/budgetController/updateBudget";
import { deleteBudget } from "../controllers/budgetController/deleteBudget";
import { getWeddingBudgetDetails } from "../controllers/budgetController/getWeddingBudgetDetails";


const router = Router();

router.use(authenticateJWT); 

router.post("/", createBudget);
router.get("/owner", getBudgetByOwner);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);
router.get("/owner/wedding-budget-details", getWeddingBudgetDetails);

export default router;
