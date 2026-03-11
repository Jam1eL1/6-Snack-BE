import cartRepository from "../repositories/cart.repository";
import { TAddToCartDto, TDeleteCartItemsDto, TToggleCheckDto } from "../dtos/cart.dto";
import { BadRequestError, NotFoundError } from "../types/error";
import prisma from "../lib/prisma";

const getMyCart = async (userId: string, isChecked: boolean) => {
  return await prisma.cartItem.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(isChecked && { isChecked: true }),
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc", // Sort by newest first
    },
  });
};

const getCartItemById = async (userId: string, cartItemId: number) => {
  const item = await cartRepository.findCartItemById(userId, cartItemId);
  if (!item) {
    throw new NotFoundError("Cart item not found.");
  }
  return [item];
};

const addToCart = async (userId: string, dto: TAddToCartDto) => {
  if (dto.quantity <= 0) {
    throw new BadRequestError("Quantity must be at least 1.");
  }
  return await cartRepository.addCartItem(userId, dto.productId, dto.quantity);
};

const deleteSelectedItems = async (userId: string, dto: TDeleteCartItemsDto) => {
  if (!dto.itemIds || dto.itemIds.length === 0) {
    throw new BadRequestError("No items were provided to delete.");
  }
  return await cartRepository.deleteCartItems(userId, dto.itemIds);
};

const deleteCartItem = async (userId: string, itemId: number) => {
  const deleted = await cartRepository.deleteCartItemById(userId, itemId);
  if (deleted.count === 0) {
    throw new NotFoundError("Cart item not found.");
  }
};

const toggleCheckCartItem = async (userId: string, itemId: number, dto: TToggleCheckDto) => {
  const updated = await cartRepository.updateCartItemChecked(userId, itemId, dto.isChecked);
  if (updated.count === 0) {
    throw new NotFoundError("Cart item not found.");
  }
};

const toggleAllCheck = async (userId: string, isChecked: boolean) => {
  await cartRepository.updateAllCartItemsChecked(userId, isChecked);
};

const updateQuantity = async (userId: string, itemId: number, quantity: number) => {
  if (quantity <= 0) {
    throw new BadRequestError("Quantity must be at least 1.");
  }

  const updated = await cartRepository.updateCartItemQuantity(userId, itemId, quantity);

  if (updated.count === 0) {
    throw new NotFoundError("Cart item not found.");
  }
};

export default {
  getMyCart,
  getCartItemById,
  addToCart,
  deleteSelectedItems,
  deleteCartItem,
  toggleCheckCartItem,
  toggleAllCheck,
  updateQuantity,
};
