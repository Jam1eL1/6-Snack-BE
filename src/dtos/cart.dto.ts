export type TAddToCartDto = {
  productId: number;
  quantity: number;
};

export type TDeleteCartItemsDto = {
  itemIds: number[];
};

export type TToggleCheckDto = {
  isChecked: boolean;
};

export type TCartItemParamsDto = {
  item: string;
};

export type TToggleAllCheckDto = {
  isChecked: boolean;
};

export type TUpdateQuantityDto = {
  quantity: number;
};

export type TGetMyCartQueryDto = {
  cartItemId?: string;
  isChecked?: "true" | "false";
};
