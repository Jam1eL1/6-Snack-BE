import { Router } from "express";
import productController from "../controllers/product.controller";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import upload from "../middlewares/upload.middleware";

const productRouter = Router();

productRouter.get("/category", productController.getCategoryTree);

// Create a product
productRouter.post(
  "/",
  authenticateToken,
  upload.single("image"),
  productController.createProduct,
);

// Get product details
productRouter.get(
  "/:id",
  authenticateToken,
  productController.getProductDetail,
);

// Update a product
productRouter.patch(
  "/:id",
  authenticateToken,
  productController.updateProduct,
);

// Delete a product
productRouter.delete(
  "/:id",
  authenticateToken,
  productController.deleteProduct,
);

// Get products
productRouter.get("/", authenticateToken, productController.getProducts);

export default productRouter;
