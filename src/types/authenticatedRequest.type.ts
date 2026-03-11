import { Request } from "express";
import { Prisma } from "../generated/prisma/client";

export type TAuthenticatedRequest = Request & {
  user?: Prisma.UserGetPayload<{ include: { company: true } }>;
};
