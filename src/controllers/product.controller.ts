import { RequestHandler } from "express";
import productService from "../services/product.service";
import {
  AppError,
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} from "../types/error";
import { getS3URL, uploadImageToS3 } from "../utils/s3";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import {
  TCreateProductDto,
  TGetMyProductsQueryDto,
  TGetProductsQueryDto,
  TProductIdParamsDto,
  TUpdateProductDto,
} from "../dtos/product.dto";
import { Role } from "../generated/prisma/client";

/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product API
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Product Registration
 *     description: "Register a new product. Also supports image file upload."
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Product name (1-15 characters)"
 *                 example: "Test Product"
 *               price:
 *                 type: string
 *                 description: "Price (0 or higher)"
 *                 example: "10000"
 *               linkUrl:
 *                 type: string
 *                 description: "Product link URL"
 *                 example: "https://example.com"
 *               categoryId:
 *                 type: string
 *                 description: "Category ID"
 *                 example: "1"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Product image file (optional)"
 *     responses:
 *       201:
 *         description: "Product successfully created"
 *         headers:
 *           Location:
 *             description: "URL of the created product"
 *             schema:
 *               type: string
 *               example: "/products/1"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "테스트 상품"
 *                 price:
 *                   type: integer
 *                   example: 10000
 *                 linkUrl:
 *                   type: string
 *                   example: "https://example.com"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://s3.amazonaws.com/image.jpg"
 *                 categoryId:
 *                   type: integer
 *                   example: 1
 *                 creatorId:
 *                   type: string
 *                   example: "user123"
 *       401:
 *         description: "Login required"
 *       400:
 *         description: "Invalid request data"
 *       500:
 *         description: "Server error"
 */
//상품등록
const createProduct: RequestHandler<{}, {}, TCreateProductDto> = async (req, res) => {
  try {
    const { name, price, linkUrl, categoryId } = req.body;
    const creatorId = req.user?.id;

    const priceNum = parseNumberOrThrow(price, "price");
    const categoryIdNum = parseNumberOrThrow(categoryId, "categoryId");

    if (!creatorId) {
      throw new AuthenticationError("User authentication required. Please log in again.");
    }

    let imageUrl = "";
    if (req.file) {
      try {
        const s3Key = await uploadImageToS3(req.file);
        imageUrl = getS3URL(s3Key);
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestError(error.message);
        }
        throw new BadRequestError("Image upload failed.");
      }
    }

    const input = {
      name,
      price: priceNum,
      linkUrl,
      categoryId: categoryIdNum,
      imageUrl,
      creatorId,
    };
    const product = await productService.createProduct(input);
    if (product) {
      res.status(201).location(`/products/${product.id}`).json(product);
    } else {
      throw new ServerError("A problem occurred while registering the product. Please try again later.");
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.code || 500).json({ message: error.message, data: error.data });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "A server error occurred. Please try again later." });
    }
  }
};

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Product Search
 *     description: "Search product list. Supports sorting, category filtering, and pagination."
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, popular, low, high]
 *         description: "Sort criteria"
 *         example: "latest"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: "Filter by category ID"
 *         example: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: "Number of products to fetch at once (max 50)"
 *         example: "9"
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: "Product ID for cursor-based pagination"
 *         example: "10"
 *     responses:
 *       200:
 *         description: "Product list search successful"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "테스트 상품"
 *                       price:
 *                         type: integer
 *                         example: 10000
 *                       imageUrl:
 *                         type: string
 *                         example: "https://s3.amazonaws.com/image.jpg"
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *                   description: "Cursor for next page"
 *                   example: 15
 *       400:
 *         description: "Invalid request data"
 *       500:
 *         description: "Server error"
 */
//상품 조회
const getProducts: RequestHandler<{}, {}, {}, TGetProductsQueryDto> = async (req, res, next) => {
  try {
    const { sort = "latest", category, cursor, limit } = req.query;
    const user = req.user;

    const take = limit ? Math.min(parseNumberOrThrow(limit!, "limit"), 50) : 9;
    const cursorId = cursor ? parseNumberOrThrow(cursor!, "cursor") : undefined;
    const categoryId = category ? parseNumberOrThrow(category!, "category") : undefined;

    const rawSort = String(sort);
    const validSorts = ["latest", "popular", "low", "high"] as const;
    const sortOption = validSorts.includes(rawSort as any) ? (rawSort as (typeof validSorts)[number]) : "latest";

    const cursorObj = cursorId ? { id: cursorId } : undefined;

    const items = await productService.getProductList({
      sort: sortOption,
      category: categoryId,
      take,
      cursor: cursorObj,
      userId: user?.id,
    });

    const nextCursor = items.length === take ? items[items.length - 1].id : null;

    res.json({ items, nextCursor: nextCursor || null });
  } catch (error) {
    next(error instanceof Error ? error : new ServerError("Unexpected error", error));
  }
};

/**
 * @swagger
 * /products/my:
 *   get:
 *     summary: "My Registered Products Search"
 *     description: Search the list of products registered by the currently logged-in user.
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: "Page number (default: 1)"
 *         example: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: "Number of products per page (default: 10)"
 *         example: "10"
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [latest, oldest, priceLow, priceHigh]
 *         description: "Sort criteria (default: latest)"
 *         example: "latest"
 *     responses:
 *       200:
 *         description: "My product list search successful"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "My Product 1"
 *                       price:
 *                         type: integer
 *                         example: 10000
 *                       imageUrl:
 *                         type: string
 *                         example: "https://s3.amazonaws.com/image.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       example: 25
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: "Login required"
 *       500:
 *         description: "Server error"
 */
// 유저가 등록한 상품 목록
const getMyProducts: RequestHandler<{}, {}, {}, TGetMyProductsQueryDto> = async (req, res, next) => {
  try {
    const creatorId = req.user?.id;
    if (!creatorId) {
      throw new AuthenticationError("Login required.");
    }

    const page = req.query.page ? parseNumberOrThrow(req.query.page, "page") : 1;
    const limit = req.query.limit ? parseNumberOrThrow(req.query.limit, "limit") : 10;
    const skip = (page - 1) * limit;

    const orderByParam = req.query.orderBy || "latest";

    let orderBy: { createdAt?: "asc" | "desc"; price?: "asc" | "desc" };

    switch (orderByParam) {
      case "priceLow":
        orderBy = { price: "asc" };
        break;
      case "priceHigh":
        orderBy = { price: "desc" };
        break;
      case "latest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const { items, totalCount } = await productService.getProductsCreator({
      creatorId,
      skip,
      take: limit,
      orderBy,
      userId: creatorId,
    });

    res.json({
      items,
      meta: {
        totalCount,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

//상품 상세 페이지
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Product Detail Search
 *     description: "Search detailed information of a specific product."
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Product ID"
 *         example: "1"
 *     responses:
 *       200:
 *         description: "Product detail information search successful"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "테스트 상품"
 *                 price:
 *                   type: integer
 *                   example: 10000
 *                 linkUrl:
 *                   type: string
 *                   example: "https://example.com"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://s3.amazonaws.com/image.jpg"
 *                 categoryId:
 *                   type: integer
 *                   example: 1
 *                 creatorId:
 *                   type: string
 *                   example: "user123"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00Z"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Beverages"
 *                 creator:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user123"
 *                     name:
 *                       type: string
 *                       example: "Test User"
 *       404:
 *         description: "Product not found"
 *       500:
 *         description: "Server error"
 */
export const getProductDetail: RequestHandler<TProductIdParamsDto> = async (req, res, next) => {
  try {
    const id = parseNumberOrThrow(req.params.id, "Product ID");
    const user = req.user;

    const product = await productService.getProductById(id, user?.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

//상품 수정
export const updateProduct: RequestHandler<TProductIdParamsDto, {}, TUpdateProductDto> = async (req, res, next) => {
  try {
    const id = parseNumberOrThrow(req.params.id, "Product ID");
    const { name, price, linkUrl, categoryId } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId) {
      throw new AuthenticationError("Login required.");
    }

    const product = await productService.getProductById(id);
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const priceNum = parseNumberOrThrow(price, "price");
    const categoryIdNum = parseNumberOrThrow(categoryId, "categoryId");

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file);
    }

    const input = {
      name,
      price: priceNum,
      linkUrl,
      categoryId: categoryIdNum,
      ...(imageUrl && { imageUrl }),
    };

    const updated = await productService.updateProduct(id, creatorId, input);
    if (updated) {
      res.status(200).json(updated);
    } else {
      throw new ServerError("Failed to update product.");
    }
  } catch (error) {
    next(error);
  }
};

// 상품 수정 어드민
export const forceUpdateProduct: RequestHandler<TProductIdParamsDto, {}, TUpdateProductDto> = async (
  req,
  res,
  next,
) => {
  try {
    const id = parseNumberOrThrow(req.params.id, "Product ID");
    const { name, price, linkUrl, categoryId } = req.body;
    const user = req.user;

    if (!user?.id) {
      throw new AuthenticationError("Login required.");
    }

    const admin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    if (!admin) {
      throw new ForbiddenError("Only administrators can access.");
    }

    const product = await productService.getProductById(id);
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const priceNum = parseNumberOrThrow(price, "price");
    const categoryIdNum = parseNumberOrThrow(categoryId, "categoryId");

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file);
    }

    const input = {
      name,
      price: priceNum,
      linkUrl,
      categoryId: categoryIdNum,
      ...(imageUrl && { imageUrl }),
    };

    const updated = await productService.updateProduct(id, product.creatorId, input);
    if (updated) {
      res.status(200).json(updated);
    } else {
      throw new ServerError("Failed to update product.");
    }
  } catch (error) {
    next(error);
  }
};

//상품 삭제
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Product Delete
 *     description: "Delete products you registered (soft delete)."
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Product ID to delete"
 *         example: "1"
 *     responses:
 *       204:
 *         description: "Product deletion successful"
 *       401:
 *         description: "Login required or no permission"
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const deleteProduct: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const productId = parseNumberOrThrow(req.params.id, "상품 ID");
    const userId = req.user?.id;

    const product = await productService.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const owner = product.creatorId === userId;
    if (!owner) {
      throw new ForbiddenError("You can only delete products you registered.");
    }

    await productService.deleteProduct(productId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

//상품 삭제 어드민
/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Product Delete (Admin)
 *     description: "Administrator forcibly deletes all products (soft delete)."
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Product ID to delete"
 *         example: "1"
 *     responses:
 *       204:
 *         description: "Product forced deletion successful"
 *       401:
 *         description: "Login required"
 *       403:
 *         description: "Administrator permission required"
 *       404:
 *         description: "Product not found"
 *       500:
 *         description: "Server error"
 */
export const forceDeleteProduct: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const productId = parseNumberOrThrow(req.params.id, "상품 ID");
    const userRole = req.user?.role;

    const admin = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN;
    if (!admin) {
      throw new ForbiddenError("Only administrators can access.");
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    await productService.deleteProduct(productId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Product Category Search
 *     description: "Search the hierarchical structure of product categories."
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: "Category tree search successful"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 parentCategory:
 *                   type: array
 *                   description: "Parent category list"
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "음료"
 *                 childrenCategory:
 *                   type: object
 *                   description: "Child category list (using parent category name as key)"
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 3
 *                         name:
 *                           type: string
 *                           example: "콜라"
 *                   example:
 *                     음료:
 *                       - id: 3
 *                         name: "콜라"
 *                       - id: 4
 *                         name: "사이다"
 *                     과자:
 *                       - id: 5
 *                         name: "초코파이"
 *       500:
 *         description: "Server error"
 */
const getCategoryTree: RequestHandler = async (req, res, next) => {
  try {
    const categories = await productService.getCategory();
    res.json(categories);
  } catch (error) {
    next(error instanceof Error ? error : new ServerError("Error during category search", error));
  }
};

export default {
  createProduct,
  getProducts,
  getMyProducts,
  getProductDetail,
  updateProduct,
  deleteProduct,
  forceUpdateProduct,
  forceDeleteProduct,
  getCategoryTree,
};
