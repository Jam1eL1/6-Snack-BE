import { RequestHandler } from "express";
import cartService from "../services/cart.service";
import {
  TAddToCartDto,
  TDeleteCartItemsDto,
  TToggleCheckDto,
  TToggleParamsDto,
  TToggleAllCheckDto,
  TUpdateQuantityDto,
} from "../dtos/cart.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import budgetService from "../services/budget.service";
import { AuthenticationError } from "../types/error";

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Cart API
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get cart items
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: cartItemId
 *         schema:
 *           type: string
 *         description: Specific cart item ID
 *       - in: query
 *         name: isChecked
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether to return only checked items
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 *       401:
 *         description: Authentication failed
 */

const getMyCart: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const { cartItemId, isChecked } = req.query;

    if (user.role === "USER" && cartItemId) {
      const item = await cartService.getCartItemById(user.id, parseNumberOrThrow(cartItemId as string, "cartitemId"));
      res.json({ cart: item });
      return;
    }

    const onlyChecked = isChecked === "true";
    const cart = await cartService.getMyCart(user.id, onlyChecked);

    if (user.role !== "USER") {
      const budget = await budgetService.getMonthlyBudget(user.companyId);
      res.json({
        cart,
        budget: {
          currentMonthBudget: budget.currentMonthBudget,
          currentMonthExpense: budget.currentMonthExpense,
        },
      });
      return;
    }

    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product added to cart successfully
 *       400:
 *         description: Invalid request
 */

const addToCart: RequestHandler<{}, {}, TAddToCartDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const result = await cartService.addToCart(user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /cart/{item}:
 *   delete:
 *     summary: Delete a cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: item
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       400:
 *         description: Invalid request
 */

const deleteSelectedItems: RequestHandler<{}, {}, TDeleteCartItemsDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    await cartService.deleteSelectedItems(user.id, req.body);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /cart/delete:
 *   post:
 *     summary: Delete selected cart items
 *     tags: [Cart]
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
 *                   type: number
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       400:
 *         description: Invalid request
 */

const deleteCartItem: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const itemId = parseNumberOrThrow(req.params.item, "itemId");
    await cartService.deleteCartItem(user.id, itemId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /cart/{item}/check:
 *   patch:
 *     summary: Check or uncheck a cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: item
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isChecked
 *             properties:
 *               isChecked:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: Checked status updated successfully
 *       400:
 *         description: Invalid request
 */

const toggleCheckItem: RequestHandler<TToggleParamsDto, {}, TToggleCheckDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const itemId = parseNumberOrThrow(req.params.item, "itemId");
    await cartService.toggleCheckCartItem(user.id, itemId, req.body);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /cart/check/all:
 *   patch:
 *     summary: Check or uncheck all cart items
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isChecked
 *             properties:
 *               isChecked:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: All checked states updated successfully
 *       400:
 *         description: Invalid request
 */

const toggleAllItems: RequestHandler<{}, {}, TToggleAllCheckDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    await cartService.toggleAllCheck(user.id, req.body.isChecked);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /cart/{item}/quantity:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: item
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       204:
 *         description: Quantity updated successfully
 *       400:
 *         description: Invalid request
 */

const updateQuantity: RequestHandler<{ item: string }, {}, TUpdateQuantityDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const itemId = parseNumberOrThrow(req.params.item, "itemId");
    await cartService.updateQuantity(user.id, itemId, req.body.quantity);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default {
  getMyCart,
  addToCart,
  deleteSelectedItems,
  deleteCartItem,
  toggleCheckItem,
  toggleAllItems,
  updateQuantity,
};
