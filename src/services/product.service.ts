import { Prisma } from "../generated/prisma/client";
import prisma from "../config/prisma";
import productRepository from "../repositories/product.repository";
import { AuthenticationError, NotFoundError, ServerError, ValidationError } from "../types/error";
import {
  TProductQueryOptions,
  TCreateProductParams,
  TCategoryMap,
  TParentCategory,
  TChildCategory,
} from "../types/product.types";

// Create a product
const createProduct = async (input: TCreateProductParams, tx?: Prisma.TransactionClient) => {
  const { name, price, linkUrl, imageUrl, categoryId, creatorId } = input;
  const errors: Record<string, string> = {};

  if (!creatorId) {
    throw new AuthenticationError("Authentication is required.");
  }

  if (!name || name.length < 1) {
    errors["name"] = "Product name is required and must contain at least one character.";
  }

  if (isNaN(price) || price <= 0) {
    errors["price"] = "Price must be greater than 0.";
  }

  if (isNaN(categoryId)) {
    errors["categoryId"] = "Category ID is invalid.";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Request data is invalid.", errors);
  }

  const product = await productRepository.create(input, tx);
  if (!product) {
    throw new ServerError("Failed to create product.");
  }

  return productRepository.findById(product.id, undefined, tx);
};

// Get one product by ID
const getProductById = async (id: number, userId?: string, tx?: Prisma.TransactionClient) => {
  const product = await productRepository.findProductById(id, userId, tx);

  if (!product) {
    throw new NotFoundError("Product not found.");
  }

  return product;
};

// Get products using query options
const getProductList = async (options: TProductQueryOptions, tx?: Prisma.TransactionClient) => {
  return productRepository.findManyAll(options, tx);
};

// Get products created by a specific user
const getProductsCreator = async (
  options: Pick<TProductQueryOptions, "creatorId" | "skip" | "take"> & {
    orderBy?: { createdAt?: "asc" | "desc"; price?: "asc" | "desc" };
    userId?: string;
  },
  tx?: Prisma.TransactionClient,
) => {
  if (!options.creatorId) {
    throw new ValidationError("creatorId is required.");
  }

  const [items, totalCount] = await Promise.all([
    productRepository.findManyCreator(
      {
        creatorId: options.creatorId,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        userId: options.userId,
      },
      tx,
    ),
    productRepository.countCreator(options.creatorId, tx),
  ]);

  return { items, totalCount };
};

// Count products created by a specific user
const countProducts = async (creatorId: string, tx?: Prisma.TransactionClient) => {
  return productRepository.countCreator(creatorId, tx);
};

const updateProduct = async (
  productId: number,
  creatorId: string,
  input: Partial<TCreateProductParams>,
  tx?: Prisma.TransactionClient,
) => {
  const existing = await productRepository.findProductById(productId, undefined, tx);

  if (!existing) {
    throw new NotFoundError("Product not found.");
  }

  if (existing.creatorId !== creatorId) {
    throw new AuthenticationError("You do not have permission to update this product.");
  }

  const updated = await productRepository.update(productId, input, tx);
  if (!updated) {
    throw new ServerError("Failed to update product.");
  }

  return productRepository.findProductById(productId, undefined, tx);
};

const deleteProduct = async (id: number, tx?: Prisma.TransactionClient) => {
  if (!tx) {
    return await prisma.$transaction(async (transactionClient) => {
      return await deleteProductWithRelatedData(id, transactionClient);
    });
  }

  return await deleteProductWithRelatedData(id, tx);
};

// Delete a product and its related data
const deleteProductWithRelatedData = async (productId: number, tx: Prisma.TransactionClient) => {
  // 1. Soft-delete the product
  const deletedProduct = await productRepository.softDeleteById(productId, tx);

  // 2. Soft-delete all cart items for the product
  await tx.cartItem.updateMany({
    where: {
      productId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // 3. Permanently delete all favorites for the product
  await tx.favorite.deleteMany({
    where: { productId },
  });

  return deletedProduct;
};

// Categories
const getCategory = async (): Promise<TCategoryMap> => {
  const categories = await productRepository.findAllCategories();

  const parentCategory: TParentCategory[] = [];
  const childrenCategory: Record<string, TChildCategory[]> = {};

  for (const category of categories) {
    if (category.parentId == null) {
      parentCategory.push({ id: category.id, name: category.name });
    }
  }

  for (const parent of parentCategory) {
    const children: TChildCategory[] = categories
      .filter((c) => c.parentId === parent.id)
      .map((c) => ({ id: c.id, name: c.name }));

    childrenCategory[parent.name] = children;
  }

  return { parentCategory, childrenCategory };
};

export default {
  createProduct,
  getProductById,
  getProductList,
  getProductsCreator,
  countProducts,
  updateProduct,
  deleteProduct,
  getCategory,
};
