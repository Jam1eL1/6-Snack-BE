import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let status = error.code ?? 500;

  // Prisma 에러 처리
  if (error.code === "P2002") {
    status = 409; // Conflict
  } else if (error.code === "P2025") {
    status = 404; // Not Found
  } else if (error.code === "P2003") {
    status = 400; // Bad Request
  } else if (typeof error.code === "number") {
    status = error.code;
  }

  res.status(status).json({
    path: req.path,
    method: req.method,
    message: error.message ?? "An unexpected error occurred.",
    data: error.data ?? undefined,
    date: new Date(),
  });
};

export default errorHandler;
