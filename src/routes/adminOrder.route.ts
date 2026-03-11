import { Router } from "express";
import orderController from "../controllers/order.controller";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import authorizeRoles from "../middlewares/authorizeRoles.middleware";
import validateUpdateStatusOrderBody from "../middlewares/validateUpdateStatusOrderBody.middleware";
import validateGetOrderQuery from "../middlewares/validateGetOrderQuery.middleware";

const adminOrderRouter = Router();

// Get order history (pending or approved)
adminOrderRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  validateGetOrderQuery,
  orderController.getOrders,
);

// Get order details (pending or approved)
adminOrderRouter.get("/:orderId", authenticateToken, authorizeRoles("ADMIN", "SUPER_ADMIN"), orderController.getOrder);

// Approve or reject order
adminOrderRouter.patch(
  "/:orderId",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  validateUpdateStatusOrderBody,
  orderController.updateOrder,
);

// Instant purchase (admin only)
adminOrderRouter.post(
  "/instant",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  orderController.createInstantOrder,
);

export default adminOrderRouter;
