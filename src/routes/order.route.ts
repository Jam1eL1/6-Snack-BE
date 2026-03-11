import { Router } from "express";
import orderController from "../controllers/order.controller";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import { cacheMiddleware, invalidateCache } from "../middlewares/cacheMiddleware";

const router = Router();

// Create purchase request
router.post("/", authenticateToken, orderController.createOrder);

// Get my purchase request list
router.get("/", authenticateToken, orderController.getOrdersByUserId);

// Get purchase request details
router.get("/:orderId", authenticateToken, orderController.getOrderById);

// Cancel purchase request
router.patch(
  "/:orderId",
  authenticateToken,
  orderController.cancelOrder,
);

export default router;
