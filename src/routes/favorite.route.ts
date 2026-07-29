import { Router } from "express";
import authenticateToken from "../middlewares/jwtAuth.middleware";
import favoriteController from "../controllers/favorite.controller";

const favoriteRouter = Router();

// Get favorites
favoriteRouter.get("/", authenticateToken, favoriteController.getFavorites);

// Add a favorite
favoriteRouter.post(
  "/:productId",
  authenticateToken,
  favoriteController.createFavorite,
);

// Remove a favorite
favoriteRouter.delete(
  "/:productId",
  authenticateToken,
  favoriteController.deleteFavorite,
);

export default favoriteRouter;
