import { Role } from "../generated/prisma/client";

export type TAccessTokenPayload = {
  userId: string;
  role: Role;
  tokenType: "access";
};

export type TRefreshTokenPayload = {
  userId: string;
  tokenType: "refresh";
};
