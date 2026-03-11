import { RequestHandler } from "express";
import orderService from "../services/order.service";
import {
  TGetOrderParamsDto,
  TGetOrderQueryDto,
  TGetOrdersQueryDto,
  TUpdateStatusOrderBodyDto,
} from "../dtos/order.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { AuthenticationError, NotFoundError } from "../types/error";
import orderRepository from "../repositories/order.repository";

/**
 * @swagger
 * tags:
 *   - name: Order
 *     description: Order API
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags:
 *       - Order
 *     summary: Get order history (pending or approved)
 *     description: Retrieves pending or approved order history with pagination and sorting for admin users.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved]
 *         required: true
 *         description: "Order status (pending or approved)"
 *         example: pending
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number (default is 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         required: false
 *         description: Number of items per page (default is 4)
 *         example: 4
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [latest, priceLow, priceHigh]
 *         required: false
 *         description: "Sort order (latest, priceLow, priceHigh)"
 *         example: latest
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "d71e5c0f-1e9a-43ef-b8f8-25f0c30cf815"
 *                       companyId:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: string
 *                         example: "user-3"
 *                       approver:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       adminMessage:
 *                         type: string
 *                         example: "Message for admin"
 *                       requestMessage:
 *                         type: string
 *                         nullable: true
 *                         example: "Request message"
 *                       deliveryFee:
 *                         type: integer
 *                         example: 3000
 *                       productsPriceTotal:
 *                         type: integer
 *                         example: 3500
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-11T14:15:44.644Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-11T14:15:44.644Z"
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED]
 *                         example: "PENDING"
 *                       requester:
 *                         type: string
 *                         example: "User"
 *                       productName:
 *                         type: string
 *                         example: "Haitai Homerun Ball and 1 more"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 2
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 4
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: "Invalid request (e.g., missing status or invalid value)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide status (pending or approved)."
 *       401:
 *         description: Authentication failed or insufficient permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user."
 *       404:
 *         description: Order history not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order history not found."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unknown server error occurred."
 */

// Get order history (pending or approved)
const getOrders: RequestHandler<{}, {}, {}, TGetOrdersQueryDto> = async (req, res, next) => {
  const page = parseNumberOrThrow(req.query.page ?? "1", "page");
  const limit = parseNumberOrThrow(req.query.limit ?? "4", "limit");
  const { orderBy, status } = req.query;
  const user = req.user;

  if (!user) throw new AuthenticationError("Invalid user.");

  const companyId = user.companyId;

  const orderList = await orderService.getOrders({ page, limit, orderBy, status }, companyId);

  res.status(200).json(orderList);
};

/**
 * @swagger
 * /admin/orders/{orderId}:
 *   get:
 *     summary: Get order details (pending or approved)
 *     description: |
 *       Retrieves detailed information for a specific purchase request using order ID and status (pending or approved).
 *       ADMIN or SUPER_ADMIN permission is required.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: Order ID to retrieve
 *         schema:
 *           type: string
 *           example: "d71e5c0f-1e9a-43ef-b8f8-25f0c30cf815"
 *       - in: query
 *         name: status
 *         required: true
 *         description: Status value ("pending" or "approved")
 *         schema:
 *           type: string
 *           enum: [pending, approved]
 *           example: pending
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d71e5c0f-1e9a-43ef-b8f8-25f0c30cf815"
 *                 companyId:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: string
 *                   example: "user-3"
 *                 approver:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 adminMessage:
 *                   type: string
 *                   example: "Message for admin"
 *                 requestMessage:
 *                   type: string
 *                   nullable: true
 *                   example: "Request message"
 *                 deliveryFee:
 *                   type: integer
 *                   example: 3000
 *                 productsPriceTotal:
 *                   type: integer
 *                   example: 3500
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-11T14:15:44.644Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-11T14:15:44.644Z"
 *                 status:
 *                   type: string
 *                   example: "PENDING"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user-3"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "user@codeit.com"
 *                     name:
 *                       type: string
 *                       example: "User"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *                 requester:
 *                   type: string
 *                   example: "User"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 24
 *                       productId:
 *                         type: integer
 *                         example: 4
 *                       orderId:
 *                         type: string
 *                         example: "d71e5c0f-1e9a-43ef-b8f8-25f0c30cf815"
 *                       productName:
 *                         type: string
 *                         example: "Haitai Homerun Ball"
 *                       price:
 *                         type: integer
 *                         example: 2500
 *                       imageUrl:
 *                         type: string
 *                         format: uri
 *                         example: "https://d2beg4tvxabcw1.cloudfront.net/products/haetae-homerunball.png"
 *                       quantity:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-11T14:15:44.676Z"
 *                 budget:
 *                   type: object
 *                   properties:
 *                     currentMonthBudget:
 *                       type: integer
 *                       nullable: true
 *                       example: 2000000
 *                     currentMonthExpense:
 *                       type: integer
 *                       nullable: true
 *                       example: 77800
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide status (pending or approved)."
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user."
 *       404:
 *         description: Order or budget not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order history not found."
 */

// Get order details (pending or approved)
const getOrder: RequestHandler<TGetOrderParamsDto, {}, {}, TGetOrderQueryDto> = async (req, res, next) => {
  const orderId = req.params.orderId;
  const user = req.user;

  if (!user) throw new AuthenticationError("Invalid user.");

  const { status } = req.query;

  if (!status) {
    const order = await orderRepository.getOrderById(orderId);

    if (!order) throw new NotFoundError("Order information not found.");

    res.status(200).json(order);
    return;
  }

  const companyId = user.companyId;

  const order = await orderService.getOrder(orderId, status, companyId);

  res.status(200).json(order);
};

/**
 * @swagger
 * /admin/orders/{orderId}:
 *   patch:
 *     summary: Approve or reject order
 *     description: Users with ADMIN or SUPER_ADMIN role can approve or reject a specific order.
 *     tags:
 *       - Order
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to update
 *         example: "d71e5c0f-1e9a-43ef-b8f8-25f0c30cf815"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: Order status (APPROVED or REJECTED)
 *                 enum: [APPROVED, REJECTED]
 *                 example: APPROVED
 *               adminMessage:
 *                 type: string
 *                 description: Admin message (optional)
 *                 example: Approved.
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d71e5c0f-1e9a-43ef-b8f8-25f0c30cf815"
 *                 companyId:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: string
 *                   example: user-3
 *                 approver:
 *                   type: string
 *                   example: Super Admin
 *                 adminMessage:
 *                   type: string
 *                   example: Approved.
 *                 requestMessage:
 *                   type: string
 *                   example: Request message
 *                 deliveryFee:
 *                   type: integer
 *                   example: 3000
 *                 productsPriceTotal:
 *                   type: integer
 *                   example: 3500
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-11T14:15:44.644Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-11T15:52:44.703Z"
 *                 status:
 *                   type: string
 *                   example: APPROVED
 *       400:
 *         description: Request validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide a status value."
 *       401:
 *         description: Unauthenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user."
 *       403:
 *         description: Forbidden (ADMIN or SUPER_ADMIN only)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission."
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unknown server error occurred."
 */

// Approve or reject order
const updateOrder: RequestHandler<TGetOrderParamsDto, {}, TUpdateStatusOrderBodyDto> = async (req, res, next) => {
  const user = req.user;

  if (!user) throw new AuthenticationError("Invalid user.");

  const approver = user.name;
  const companyId = user.companyId;
  const orderId = req.params.orderId;
  const { adminMessage = "", status } = req.body;

  const updatedOrder = await orderService.updateOrder(orderId, companyId, { approver, adminMessage, status });

  res.status(200).json(updatedOrder);
};

// Order request features
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create purchase request
 *     description: Creates a new purchase request.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItemIds
 *             properties:
 *               adminMessage:
 *                 type: string
 *                 description: Message for admin (optional)
 *                 example: "Requesting this purchase for a company event."
 *               requestMessage:
 *                 type: string
 *                 description: Request message (optional)
 *                 example: "Please approve quickly."
 *               cartItemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of cart item IDs
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Purchase request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 userId:
 *                   type: string
 *                   example: "user-123"
 *                 companyId:
 *                   type: integer
 *                   example: 1
 *                 status:
 *                   type: string
 *                   enum: [PENDING, APPROVED, REJECTED, CANCELED]
 *                   example: "PENDING"
 *                 totalPrice:
 *                   type: integer
 *                   example: 25000
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-09T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Purchase request created successfully."
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart items are required."
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login required."
 *       500:
 *         description: Server error
 */
const createOrder: RequestHandler<
  {},
  {},
  { adminMessage?: string; requestMessage?: string; cartItemIds: number[] }
> = async (req, res, next) => {
  try {
    const orderData = req.body;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    // Use authenticated user ID
    const authenticatedOrderData = {
      ...orderData,
      userId: req.user.id,
      companyId: req.user.companyId,
    };

    const order = await orderService.createOrder(authenticatedOrderData);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get purchase request details
 *     description: Retrieves details of a specific purchase request.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase request ID to retrieve
 *         example: "123"
 *     responses:
 *       200:
 *         description: Purchase request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Purchase request retrieved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     userId:
 *                       type: string
 *                       example: "user-123"
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, REJECTED, CANCELED]
 *                       example: "PENDING"
 *                     totalPrice:
 *                       type: integer
 *                       example: 25000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-09T10:30:00.000Z"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login required."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to access this order."
 *       404:
 *         description: Purchase request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found."
 */
const getOrderById: RequestHandler<{ orderId: string }> = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.getOrderById(orderId, req.user.id);

    res.status(200).json({
      message: "Purchase request retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get my purchase requests
 *     description: Retrieves all purchase requests for the currently logged-in user.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase request list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "My purchase request list retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       userId:
 *                         type: string
 *                         example: "user-123"
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED, REJECTED, CANCELED]
 *                         example: "PENDING"
 *                       totalPrice:
 *                         type: integer
 *                         example: 25000
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-09T10:30:00.000Z"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login required."
 */
const getOrdersByUserId: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.getOrdersByUserId(req.user.id);

    res.status(200).json({
      message: "My purchase request list retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /orders/{orderId}:
 *   patch:
 *     summary: Cancel purchase request
 *     description: Cancels a pending purchase request. Approved or rejected requests cannot be canceled.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase request ID to cancel
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CANCELED]
 *                 example: "CANCELED"
 *                 description: Cancellation status (CANCELED only)
 *     responses:
 *       200:
 *         description: Purchase request canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Purchase request canceled successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     status:
 *                       type: string
 *                       example: "CANCELED"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-09T10:35:00.000Z"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only pending orders can be canceled."
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login required."
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission to access this order."
 *       404:
 *         description: Purchase request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found."
 */
const cancelOrder: RequestHandler<{ orderId: string }, {}, { status: "CANCELED" }> = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const result = await orderService.cancelOrder(orderId, req.user.id);

    res.status(200).json({
      message: "Purchase request canceled successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /orders/instant:
 *   post:
 *     summary: Instant purchase
 *     description: Instantly purchases cart items without an approval step.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartItemIds
 *             properties:
 *               cartItemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of cart item IDs
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Instant purchase completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Instant purchase completed successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     userId:
 *                       type: string
 *                       example: "user-123"
 *                     status:
 *                       type: string
 *                       example: "APPROVED"
 *                     totalPrice:
 *                       type: integer
 *                       example: 25000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-09T10:30:00.000Z"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart items are required."
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login required."
 *       500:
 *         description: Server error
 */
const createInstantOrder: RequestHandler<{}, {}, { cartItemIds: number[] }> = async (req, res, next) => {
  try {
    const orderData = req.body;

    if (!req.user?.id) {
      throw new AuthenticationError("Login required.");
    }

    // Use authenticated user ID (without message fields)
    const authenticatedOrderData = {
      cartItemIds: orderData.cartItemIds,
      userId: req.user.id,
      companyId: req.user.companyId,
    };

    // 1. Create order
    const result = await orderService.createInstantOrder(authenticatedOrderData);

    // 2. Approve via orderService
    const approvedOrder = await orderService.updateOrder(result.id, req.user.companyId, {
      approver: req.user.name || "System",
      adminMessage: "Auto-approved via instant purchase",
      status: "APPROVED",
    });

    res.status(201).json({
      message: "Instant purchase completed successfully.",
      data: approvedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getOrders,
  getOrder,
  updateOrder,
  // Order request features
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
  createInstantOrder,
};
