// declare module "express-serve-static-core" {
//   interface Request {
//     user?: Prisma.UserGetPayload<{
//       include: { company: true };
//     }>;
//   }
// }
declare module "express-serve-static-core" {
  interface Request {
    user?: import("../generated/prisma/client").Prisma.UserGetPayload<{
      include: { company: true };
    }>;
  }
}

export {};
