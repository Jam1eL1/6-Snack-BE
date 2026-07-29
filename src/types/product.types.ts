import { Product } from "../generated/prisma/client";

export type TSortOption = "latest" | "popular" | "low" | "high";

// Product query options
export type TProductQueryOptions = {
  sort?: TSortOption;
  category?: number;
  skip?: number;
  take?: number;
  creatorId?: string;
  cursor?: { id: number } | undefined;
  orderBy?: any;
  userId?: string;
};

// Internal extension options
export type TExtendedProductQueryOptions = TProductQueryOptions & {
  categoryIds?: number[];
};

// Product type with favorite status
export type TProductWithFavorite = Product & {
  isFavorite: boolean;
  category: {
    id: number;
    name: string;
    parentId: number | null;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
};

// Product with sales count
export type TProductSaleCount = Product & {
  saleCount: number;
};

// Creator product query
export type TCreatorQueryOptions = {
  creatorId: string;
  skip?: number;
  take?: number;
  orderBy?: {
    createdAt?: "asc" | "desc";
    price?: "asc" | "desc";
  };
  userId?: string;
};

// Product creation parameters
export type TCreateProductParams = {
  name: string;
  price: number;
  linkUrl: string;
  imageUrl: string;
  categoryId: number;
  creatorId: string;
};

// Complete category returned from the database
export type TCategory = {
  id: number;
  name: string;
  parentId: number | null;
};

// Parent category
export type TParentCategory = {
  id: number;
  name: string;
};

// Child category
export type TChildCategory = {
  id: number;
  name: string;
};

// Parent and child category tree
export type TCategoryTreeNode = TParentCategory & {
  children: TChildCategory[];
};

// Frontend UI shape: parent categories and child categories grouped by name
export type TCategoryMap = {
  parentCategory: TParentCategory[];
  childrenCategory: Record<string, TChildCategory[]>;
};
