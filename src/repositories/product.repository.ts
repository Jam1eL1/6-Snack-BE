import prisma from "../config/prisma";
import { Prisma, Product } from "../generated/prisma/client";
import type {
  TProductQueryOptions,
  TCreatorQueryOptions,
  TCreateProductParams,
  TProductWithFavorite,
} from "../types/product.types";

// Get products matching the conditions, including favorite status
const findManyAll = async (
  options: TProductQueryOptions = {},
  tx?: Prisma.TransactionClient,
): Promise<TProductWithFavorite[]> => {
  const client = tx || prisma;
  const { sort = "latest", category, take = 9, cursor, userId } = options;

  const categoryIds = await getCategory(category, client);

  if (sort === "popular") {
    return findManyAllPopular({
      categoryIds,
      take,
      skip: cursor ? 1 : 0,
      userId,
    });
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "high") orderBy = { price: "desc" };
  if (sort === "low") orderBy = { price: "asc" };

  const products = await client.product.findMany({
    where: {
      deletedAt: null,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    },
    orderBy,
    take,
    cursor,
    skip: cursor ? 1 : 0,
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          deletedAt: true,
        },
      },
      favorites: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
  });

  return products.map((product) => ({
    ...product,
    isFavorite: product.favorites && product.favorites.length > 0,
  }));
};

// Sort popular products, including favorite status
const findManyAllPopular = async ({
  categoryIds,
  skip = 0,
  take = 6,
  userId,
}: {
  categoryIds?: number[];
  skip?: number;
  take?: number;
  userId?: string;
}): Promise<TProductWithFavorite[]> => {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          deletedAt: true
        }
      },
      favorites: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
    orderBy: {
      cumulativeSales: "desc",
    },
    skip,
    take,
  });

  return products.map((product) => ({
    ...product,
    isFavorite: product.favorites && product.favorites.length > 0,
  }));
};

// Get category and child-category IDs
const getCategory = async (
  category: number | undefined,
  client: Prisma.TransactionClient | typeof prisma,
): Promise<number[] | undefined> => {
  if (!category) return undefined;

  const subCategories = await client.category.findMany({
    where: { parentId: category },
    select: { id: true },
  });

  return [category, ...subCategories.map((c) => c.id)];
};

// Get one product by ID, including favorite status
const findById = async (
  id: number,
  userId?: string,
  tx?: Prisma.TransactionClient,
): Promise<TProductWithFavorite | null> => {
  const client = tx || prisma;

  const product = await client.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          deletedAt: true
        }
      },
      favorites: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
  });

  if (!product) return null;

  return {
    ...product,
    isFavorite: product.favorites && product.favorites.length > 0,
  };
};

// Create a product
const create = (data: TCreateProductParams, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.product.create({ data });
};

// Get products for a specific user, including favorite status
const findManyCreator = async (
  {
    creatorId,
    skip = 0,
    take = 10,
    orderBy = { createdAt: "desc" },
    userId,
  }: TCreatorQueryOptions & { userId?: string },
  tx?: Prisma.TransactionClient,
): Promise<TProductWithFavorite[]> => {
  const client = tx || prisma;

  const products = await client.product.findMany({
    where: { creatorId, deletedAt: null },
    skip,
    take,
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          deletedAt: true
        }
      },
      favorites: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
    orderBy,
  });

  return products.map((product) => ({
    ...product,
    isFavorite: product.favorites && product.favorites.length > 0,
  }));
};

// Count products for a specific user
const countCreator = (creatorId: string, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return client.product.count({
    where: { creatorId, deletedAt: null },
  });
};

const findProductById = async (
  id: number,
  userId?: string,
  tx?: Prisma.TransactionClient,
): Promise<TProductWithFavorite | null> => {
  const client = tx || prisma;

  const product = await client.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          deletedAt: true
        }
      },
      favorites: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
  });

  if (!product) return null;

  return {
    ...product,
    isFavorite: product.favorites && product.favorites.length > 0,
  };
};
const update = async (id: number, data: Partial<TCreateProductParams>, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  const product = await client.product.findFirst({
    where: { id, deletedAt: null },
  });

  if (!product) throw new Error("Product does not exist or has already been deleted.");

  return await client.product.update({
    where: { id },
    data,
  });
};

const softDeleteById = async (id: number, tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;
  return await client.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const findAllCategories = async () => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    },
  });
};

const updateCumulativeSales = async (productIds: number[], tx?: Prisma.TransactionClient) => {
  const client = tx || prisma;

  return await client.product.updateMany({
    where: { id: { in: productIds } },
    data: { cumulativeSales: { increment: 1 } },
  });
};

export default {
  create,
  findById,
  findManyAll,
  findManyCreator,
  countCreator,
  findProductById,
  update,
  softDeleteById,
  findAllCategories,
  updateCumulativeSales,
};
