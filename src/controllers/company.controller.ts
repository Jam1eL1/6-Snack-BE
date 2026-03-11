import { RequestHandler } from "express";
import { TUserIdParamsDto } from "../dtos/user.dto";
import { TUpdateCompanyInfoDto } from "../dtos/company.dto";
import companyService from "../services/company.service";

/**
 * @swagger
 * tags:
 *   - name: Company
 *     description: Company information API
 */
/**
 * @swagger
 * /super-admin/users/{userId}/company:
 *   patch:
 *     summary: Update company information (SUPER_ADMIN)
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID whose company information will be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - newPassword
 *               - newPasswordConfirm
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: New company name
 *               newPassword:
 *                 type: string
 *                 description: New password
 *               newPasswordConfirm:
 *                 type: string
 *                 description: Confirm new password
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company information was updated successfully."
 *       400:
 *         description: Company ID does not exist
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Forbidden (SUPER_ADMIN only)
 */
const updateCompanyInfo: RequestHandler<TUserIdParamsDto, any, TUpdateCompanyInfoDto> = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const companyId = req.user?.company.id;
    const currentUser = req.user!;

    if (!companyId) {
      res.status(400).json({ message: "Company ID does not exist." });
      return;
    }

    const result = await companyService.updateCompanyInfo(userId, req.body, currentUser, companyId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default { updateCompanyInfo };
