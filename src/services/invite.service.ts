import { TGetInviteInfoResponseDto, TCreateInviteRequestDto, TCreateInviteResponseDto } from "../dtos/invite.dto";
import inviteRepository from "../repositories/invite.repository";
import { NotFoundError, BadRequestError, ValidationError } from "../types/error";
import { Role } from "@prisma/client";
import emailService from "./email.service";

const getInviteInfo = async (inviteId: string): Promise<TGetInviteInfoResponseDto> => {
  const invite = await inviteRepository.findInviteById(inviteId);
  if (!invite) {
    throw new NotFoundError("Invite link does not exist.");
  }
  if (invite.role !== Role.USER && invite.role !== Role.ADMIN) {
    throw new NotFoundError("Invalid invite permission/role.");
  }
  return {
    id: invite.id,
    name: invite.name,
    email: invite.email,
    expiresAt: invite.expiresAt.toISOString(),
    isUsed: invite.isUsed,
    role: invite.role,
  };
};

const createInvite = async (
  data: TCreateInviteRequestDto,
  protocol: string,
  signupHost?: string,
): Promise<TCreateInviteResponseDto> => {
  const { email, name, role, companyId, invitedById, expiresInDays } = data;

  if (!email || !name || !role || !companyId || !invitedById) {
    throw new BadRequestError("Email, name, role, company ID, and inviter ID are required inputs.");
  }

  const validRoles = [Role.USER, Role.ADMIN, Role.SUPER_ADMIN];
  if (!validRoles.includes(role)) {
    throw new ValidationError(`Invalid role. Allowed roles: ${validRoles.join(", ")}`);
  }

  const existingCompany = await inviteRepository.findCompanyById(companyId);
  if (!existingCompany) {
    throw new NotFoundError("Company ID does not exist.");
  }

  const invitingUser = await inviteRepository.findUserById(invitedById);
  if (!invitingUser) {
    throw new NotFoundError("Inviter ID does not exist.");
  }

  const days = expiresInDays && typeof expiresInDays === "number" ? expiresInDays : 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const existingActiveInvite = await inviteRepository.findActiveInviteByEmail(email);
  if (existingActiveInvite) {
    await inviteRepository.deleteInviteById(existingActiveInvite.id);
    console.log(`[Existing Invite Deleted] Email: ${email}, Invite ID: ${existingActiveInvite.id}`);
  }

  const newInvite = await inviteRepository.createInvite({
    email,
    name,
    role,
    companyId,
    invitedById,
    expiresAt,
    isUsed: false,
  });

  const inviteLink = `${protocol}://${signupHost || "localhost:3000"}/signup/${newInvite.id}`;

  try {
    await sendInviteEmail(email, name, inviteLink, role, newInvite.expiresAt);
    console.log(`[Invite Created and Email Sent Successfully] Email: ${email}, Invite ID: ${newInvite.id}`);
    return {
      message: "The invite link was successfully created and the email was sent.",
      inviteId: newInvite.id,
      inviteLink: inviteLink,
      expiresAt: newInvite.expiresAt,
      emailSent: true,
    };
  } catch (emailError) {
    console.error("[Email Sending Failed]", emailError);
    return {
      message: "The invite link was created, but email sending failed.",
      inviteId: newInvite.id,
      inviteLink: inviteLink,
      expiresAt: newInvite.expiresAt,
      emailSent: false,
      emailError: "Email sending failed.",
    };
  }
};

const sendInviteEmail = async (
  email: string,
  name: string,
  inviteLink: string,
  role: string,
  expiresAt: Date,
): Promise<void> => {
  const lowerCaseRole = role.toLowerCase();
  const formattedRole = lowerCaseRole.charAt(0).toUpperCase() + lowerCaseRole.slice(1);
  const subject = `[Snack] Account Invitation - ${formattedRole} Access for ${name}`;
  const html = emailService.generateInviteEmailTemplate(name, inviteLink, role, expiresAt);

  await emailService.sendEmail({
    to: email,
    subject,
    html,
  });
};

export default { getInviteInfo, createInvite, sendInviteEmail };
