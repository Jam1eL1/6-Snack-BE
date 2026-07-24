import { Router } from "express";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import authorizeRoles from "../middlewares/authorizeRoles.middleware";
import paymentController from "../controllers/payment.controller";
import validateFailPaymentBody from "../middlewares/validateFailPaymentBody.middleware";

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
adminPaymentRouter.post(
  "/:paymentId/fail",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  validateFailPaymentBody,
  paymentController.failPayment,
);
adminPaymentRouter.post(
  "/:paymentId/complete",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  paymentController.completePayment,
);

export default adminPaymentRouter;
