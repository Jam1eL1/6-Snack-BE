import { Router } from "express";
import adminOrderRouter from "./adminOrder.route";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import authorizeRoles from "../middlewares/authorizeRoles.middleware";
import productController from "../controllers/product.controller";
import budgetController from "../controllers/budget.controller";
import adminPaymentRouter from "./payment.route";
const adminRouter = Router();

adminRouter.use("/orders", adminOrderRouter);
adminRouter.use("/payments", adminPaymentRouter);
// Get budget
adminRouter.get(
  "/:companyId/budgets",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  budgetController.getMonthlyBudget,
);

// Delete product
adminRouter.delete(
  "/products/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  productController.forceDeleteProduct,
);

// Update product
adminRouter.patch(
  "/products/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  productController.forceUpdateProduct,
);

export default adminRouter;
