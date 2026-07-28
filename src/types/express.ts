declare module "express-serve-static-core" {
  interface Request {
    user?: import("../generated/prisma/client").Prisma.UserGetPayload<{
      omit: {
        password: true;
        hashedRefreshToken: true;
      };
      include: { company: true };
    }>;
  }
}

export {};
