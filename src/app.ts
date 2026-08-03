import "./config/env";
import express, { Application, Request, Response } from "express";
import indexRouter from "./routes/index.route";
import errorHandler from "./middlewares/errorHandler.middleware";
import cookieParser from "cookie-parser";
import autoCreateMonthlyBudget from "./cron/autoCreateMonthlyBudget";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app: Application = express();
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? ["https://sn8ck.com"]
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:8080"];

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

if (!isProduction) {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req: Request, res: Response) => {
  res.send("Health Check Success");
});

app.use("/", indexRouter);

autoCreateMonthlyBudget.start();

app.use(errorHandler);

export default app;
