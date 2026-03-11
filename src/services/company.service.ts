import { TUpdateCompanyInfoDto, TUpdateCompanyInfoResponseDto } from "../dtos/company.dto";
import companyRepository from "../repositories/company.repository";
import { BadRequestError } from "../types/error";
import { TCurrentUser } from "../types/user.types";
import userService from "./user.service";

const updateCompanyInfo = async (
  userId: string,
  updateData: TUpdateCompanyInfoDto,
  currentUser: TCurrentUser,
  companyId: number,
): Promise<TUpdateCompanyInfoResponseDto> => {
  // Update company name if present in updateData.companyName.
  const newCompanyName = updateData.companyName;
  let newPasswordData = updateData.passwordData;
  let updatedCompany = null;

  // At least one field (company name or password) must be provided.
  if (!newCompanyName && !newPasswordData) {
    throw new BadRequestError("At least one field must be updated.");
  }

  // Apply new company name.
  if (newCompanyName) {
    updatedCompany = await companyRepository.updateCompanyName(companyId, newCompanyName);
  }

  // Apply new password.
  if (newPasswordData) {
    await userService.updatePassword(
      userId,
      {
        newPassword: newPasswordData.newPassword,
        newPasswordConfirm: newPasswordData.newPasswordConfirm,
      },
      currentUser,
    );
  }

  // Build response payload.
  const company = updatedCompany || (await companyRepository.findCompanyById(companyId));

  if (!company) {
    throw new BadRequestError("Company information does not exist.");
  }

  return {
    message: "Company information has been updated.",
    company: {
      id: company.id,
      name: company.name,
    },
  };
};

export default { updateCompanyInfo };
