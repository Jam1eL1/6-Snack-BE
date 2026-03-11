import { RequestHandler } from "express";
import budgetService from "../services/budget.service";
import { parseNumberOrThrow } from "../utils/parseNumberOrThrow";
import { TBudgetParamsDto } from "../dtos/budget.dto";
import { TUpdateMonthlyBudgetBody } from "../types/budget.type";

/**
 * @swagger
 * tags:
 *   - name: Budget
 *     description: Budget API
 */

/**
 * @swagger
 * /admin/{companyId}/budgets:
 *   get:
 *     tags:
 *       - Budget
 *     summary: Get budget and expense overview
 *     description: Retrieves monthly budget and expense data for a specific company (`companyId`).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: companyId
 *         in: path
 *         description: Unique numeric ID of the company
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Budget and expense overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 6
 *                 companyId:
 *                   type: integer
 *                   example: 1
 *                 currentMonthExpense:
 *                   type: integer
 *                   description: Current month expense
 *                   example: 398090
 *                 currentMonthBudget:
 *                   type: integer
 *                   description: Current month budget
 *                   example: 100000
 *                 monthlyBudget:
 *                   type: integer
 *                   description: Default monthly budget
 *                   example: 1000000
 *                 year:
 *                   type: string
 *                   description: Year (YYYY)
 *                   example: "2025"
 *                 month:
 *                   type: string
 *                   description: Month (MM)
 *                   example: "08"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-31T15:00:00.527Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-08-02T17:42:05.117Z"
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Soft-delete timestamp
 *                   example: null
 *                 currentYearTotalExpense:
 *                   type: integer
 *                   description: Total expense for the current year
 *                   example: 1189190
 *                 previousMonthBudget:
 *                   type: integer
 *                   description: Previous month budget
 *                   example: 600000
 *                 previousMonthExpense:
 *                   type: integer
 *                   description: Previous month expense
 *                   example: 746100
 *                 previousYearTotalExpense:
 *                   type: integer
 *                   description: Total expense for the previous year
 *                   example: 715000
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication token was not provided.
 *       403:
 *         description: Forbidden (ADMIN or SUPER_ADMIN only)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You do not have permission.
 *       404:
 *         description: Budget information not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Budget not found.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An unknown error occurred during authentication.
 *
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 */

// Get budget and expense overview (ADMIN, SUPER_ADMIN)
const getMonthlyBudget: RequestHandler<TBudgetParamsDto> = async (req, res, next) => {
  const companyId = parseNumberOrThrow(req.params.companyId, "companyId");
  const budget = await budgetService.getMonthlyBudget(companyId);

  res.status(200).json(budget);
};

/**
 * @swagger
 * /super-admin/{companyId}/budgets:
 *   patch:
 *     summary: Update budget
 *     description: SUPER_ADMIN users can update the current month budget for their company
 *     tags:
 *       - Budget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentMonthBudget
 *               - monthlyBudget
 *             properties:
 *               currentMonthBudget:
 *                 type: integer
 *                 description: Current month budget (number >= 0)
 *                 example: 100000
 *               monthlyBudget:
 *                 type: integer
 *                 description: Default monthly budget (number >= 0)
 *                 example: 1000000
 *     responses:
 *       200:
 *         description: Updated monthly budget returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 companyId:
 *                   type: integer
 *                 currentMonthExpense:
 *                   type: integer
 *                   description: Current month expense
 *                 currentMonthBudget:
 *                   type: integer
 *                 monthlyBudget:
 *                   type: integer
 *                 year:
 *                   type: string
 *                   example: "2025"
 *                 month:
 *                   type: string
 *                   example: "08"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   description: Soft-delete timestamp (null means not deleted)
 *       400:
 *         description: "Request body validation failed (e.g., negative number or string input)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Budget values must be 0 or higher."
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication token was not provided."
 *       403:
 *         description: Insufficient permission (SUPER_ADMIN required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You do not have permission."
 *       404:
 *         description: Budget information for the target company was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Budget not found."
 */

// Update budget (SUPER_ADMIN)
const updateMonthlyBudget: RequestHandler<TBudgetParamsDto, {}, TUpdateMonthlyBudgetBody> = async (req, res, next) => {
  const companyId = parseNumberOrThrow(req.params.companyId, "companyId");
  const body = req.body;

  const updatedBudget = await budgetService.updateMonthlyBudget(companyId, body);

  res.status(200).json(updatedBudget);
};

export default {
  getMonthlyBudget,
  updateMonthlyBudget,
};
