import { RequestHandler } from "express";
import cartService from "../services/cart.service";
import {
  TAddToCartDto,
  TDeleteCartItemsDto,
  TGetMyCartQueryDto,
  TToggleCheckDto,
  TToggleAllCheckDto,
  TUpdateQuantityDto,
  TCartItemParamsDto,
} from "../dtos/cart.dto";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import budgetService from "../services/budget.service";
import { AuthenticationError } from "../types/error";



const getMyCart: RequestHandler<{}, {}, {}, TGetMyCartQueryDto> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const { cartItemId, isChecked } = req.query;

    if (user.role === "USER" && cartItemId) {
      const item = await cartService.getCartItemById(user.id, parseNumberOrThrow(cartItemId, "cartitemId"));
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


const addToCart: RequestHandler<{}, {}, TAddToCartDto, {}> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    const result = await cartService.addToCart(user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};


const deleteSelectedItems: RequestHandler<{}, {}, TDeleteCartItemsDto, {}> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    await cartService.deleteSelectedItems(user.id, req.body);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};


const deleteCartItem: RequestHandler<TCartItemParamsDto, {}, {}, {}> = async (req, res, next) => {
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


const toggleCheckItem: RequestHandler<TCartItemParamsDto, {}, TToggleCheckDto, {}> = async (req, res, next) => {
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


const toggleAllItems: RequestHandler<{}, {}, TToggleAllCheckDto, {}> = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError("User information could not be found.");

    await cartService.toggleAllCheck(user.id, req.body.isChecked);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};


const updateQuantity: RequestHandler<TCartItemParamsDto, {}, TUpdateQuantityDto, {}> = async (req, res, next) => {
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
