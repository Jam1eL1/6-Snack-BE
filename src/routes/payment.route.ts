import { Router } from "express";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import authorizeRoles from "../middlewares/authorizeRoles.middleware";
import paymentController from "../controllers/payment.controller";

const adminPaymentRouter = Router();
adminPaymentRouter.get(
  "/:paymentId",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  paymentController.getPayment,
);
adminPaymentRouter.post(
  "/:paymentId/claim",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  paymentController.claimPayment,
);
adminPaymentRouter.post(
  "/:paymentId/retry",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  paymentController.retryPayment,
);

export default adminPaymentRouter;
