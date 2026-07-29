import { RequestHandler } from "express";
import favoriteService from "../services/favorite.service";
import { AuthenticationError } from "../types/error";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { TFavoriteParamsDto, TGetFavoritesQueryDto } from "../dtos/favorite.dto";



const getFavorites: RequestHandler<{}, {}, {}, TGetFavoritesQueryDto> = async (req, res, next) => {
  const user = req.user;
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
  const limit = parseNumberOrThrow(req.query.limit ?? "6", "limit");

  if (!user) throw new AuthenticationError("User information is unavailable.");

  const favorites = await favoriteService.getFavorites(user.id, { cursor, limit });

  res.status(200).json(favorites);
};


const createFavorite: RequestHandler<TFavoriteParamsDto> = async (req, res, next) => {
  const user = req.user;
  const productId = parseNumberOrThrow(req.params.productId, "productId");

  if (!user) throw new AuthenticationError("User information is unavailable.");

  const favorite = await favoriteService.createFavorite(user.id, productId);

  res.status(200).json(favorite);
};


const deleteFavorite: RequestHandler<TFavoriteParamsDto> = async (req, res, next) => {
  const user = req.user;

  if (!user) throw new AuthenticationError("User information is unavailable.");

  const productId = parseNumberOrThrow(req.params.productId, "productId");

  await favoriteService.deleteFavorite(user.id, productId);

  res.status(204).send();
};

export default {
  getFavorites,
  createFavorite,
  deleteFavorite,
};
