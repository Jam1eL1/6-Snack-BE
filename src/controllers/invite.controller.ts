import { RequestHandler } from "express";
import { TInviteIdParamsDto, TCreateInviteRequestDto } from "../dtos/invite.dto";
import { Role } from "../generated/prisma/client";
import inviteService from "../services/invite.service";

/**
 * @swagger
 * tags:
 *   - name: Invite
 *     description: User invitation API
 */

/**
 * @swagger
 * /invite:
 *   post:
 *     summary: Send user invitation email
 *     description: A SUPER_ADMIN invites a new user to the company and assigns a role (excluding SUPER_ADMIN). An invitation email is sent automatically.
 *     tags: [Invite]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - role
 *               - companyId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user to invite
 *                 example: "user1@example.com"
 *               name:
 *                 type: string
 *                 description: Name of the user to invite
 *                 example: "Alex Park"
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 description: Role to assign to the invited user (SUPER_ADMIN excluded)
 *                 example: "USER"
 *               companyId:
 *                 type: integer
 *                 description: Company ID
 *                 example: 1
 *               expiresInDays:
 *                 type: integer
 *                 description: Invite link validity period in days (default is 7)
 *                 example: 7
 *                 default: 7
 *     responses:
 *       201:
 *         description: Invite created and email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invite:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "user1@example.com"
 *                     name:
 *                       type: string
 *                       example: "Alex Park"
 *                     companyId:
 *                       type: integer
 *                       example: 1
 *                     role:
 *                       type: string
 *                       enum: [USER, ADMIN]
 *                       example: "USER"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-16T10:30:00.000Z"
 *                     isUsed:
 *                       type: boolean
 *                       example: false
 *                 message:
 *                   type: string
 *                   example: "Invitation email was sent successfully."
 *       400:
 *         description: Invalid request (e.g., missing required fields, invalid email format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This email already exists."
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid token."
 *       403:
 *         description: Forbidden (SUPER_ADMIN only)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "SUPER_ADMIN permission is required."
 *       404:
 *         description: Company or inviter not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company not found."
 *       500:
 *         description: Server error (e.g., email delivery failure)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while sending the email."
 */
const createInvite: RequestHandler<{}, any, TCreateInviteRequestDto> = async (req, res, next) => {
  try {
    const result = await inviteService.createInvite(req.body, req.protocol, process.env.SIGNUP_HOST);
    res.status(201).json(result);
  } catch (error) {
    console.error("[Invite Creation Error]", error);
    next(error);
  }
};

/**
 * @swagger
 * /invite/{inviteId}:
 *   get:
 *     summary: Get invite information
 *     description: Retrieves invitation details by invite ID. Used when someone opens an invite link.
 *     tags: [Invite]
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique invite ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Invite information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invite:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "user1@example.com"
 *                     name:
 *                       type: string
 *                       example: "Alex Park"
 *                     companyId:
 *                       type: integer
 *                       example: 1
 *                     role:
 *                       type: string
 *                       enum: [USER, ADMIN]
 *                       example: "USER"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-16T10:30:00.000Z"
 *                     isUsed:
 *                       type: boolean
 *                       example: false
 *                     company:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: "Snack Company"
 *                         bizNumber:
 *                           type: string
 *                           example: "123-45-67890"
 *                 message:
 *                   type: string
 *                   example: "Invite information retrieved successfully."
 *       404:
 *         description: Invite information not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This invite link is invalid."
 *       410:
 *         description: Invite link expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This invite link has expired."
 */
const getInviteInfo: RequestHandler<TInviteIdParamsDto> = async (req, res, next) => {
  const inviteId = req.params.inviteId;
  try {
    const result = await inviteService.getInviteInfo(inviteId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default { createInvite, getInviteInfo };
