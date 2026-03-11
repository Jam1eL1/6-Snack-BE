import { Router } from "express";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import authorizeRoles from "../middlewares/authorizeRoles.middleware";
import userController from "../controllers/user.controller";
import companyController from "../controllers/company.controller";
import budgetController from "../controllers/budget.controller";
import validateBudgetBody from "../middlewares/validateBudgetBody.middleware";

const superAdminRouter = Router();

// Delete user account
superAdminRouter.delete(
  "/users/:userId",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  userController.deleteUser,
);

// Update user role
superAdminRouter.patch(
  "/users/:userId/role",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  userController.updateRole,
);

// Update company name and super admin password
superAdminRouter.patch(
  "/users/:userId/company",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  companyController.updateCompanyInfo,
);

// Get users in super admin's company
superAdminRouter.get(
  "/users",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  userController.getUsersByCompany,
);

// Update budget (SUPER_ADMIN)
superAdminRouter.patch(
  "/:companyId/budgets",
  authenticateToken,
  authorizeRoles("SUPER_ADMIN"),
  validateBudgetBody,
  budgetController.updateMonthlyBudget,
);

export default superAdminRouter;
