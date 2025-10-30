import {
  TUpdatePasswordDto,
  UserRole,
  TDeleteUserResponseDto,
  TUpdateRoleResponseDto,
  TUpdatePasswordResponseDto,
  TGetUsersQueryDto,
  TGetUsersResponseDto,
  TGetUserInfoResponseDto,
} from "../dtos/user.dto";
import userRepository from "../repositories/user.repository";
import { BadRequestError, NotFoundError } from "../types/error";
import { TCurrentUser } from "../types/user.types";
import bcrypt from "bcrypt";

const getUserInfo = async (userId: string, currentUser: TCurrentUser): Promise<TGetUserInfoResponseDto> => {
  if (userId !== currentUser.id) {
    throw new BadRequestError("You can only view your own information."); 
  }

  if (currentUser.role === "USER") {
    return {
      message: "User information successfully retrieved",
      user: {
        company: { name: currentUser.company!.name },
        name: currentUser.name,
        email: currentUser.email,
      },
    };
  } else {
    return {
      message: "Admin/Super Admin information successfully retrieved", 
      user: {
        company: { name: currentUser.company!.name },
        role: currentUser.role as "ADMIN" | "SUPER_ADMIN",
        name: currentUser.name,
        email: currentUser.email,
      },
    };
  }
};

// User deletion/withdrawal
const deleteUser = async (userId: string, currentUser: TCurrentUser): Promise<TDeleteUserResponseDto> => {
  const userToDelete = await userRepository.findActiveUserById(userId);
  if (!userToDelete) {
    throw new NotFoundError("User does not exist"); 
  }

  if (userToDelete.id === currentUser.id) {
    throw new BadRequestError("A Super Admin cannot delete themselves."); 
  }

  await userRepository.deleteUser(userId);

  return {
    message: "User successfully deleted.", 
  };
};

// Update user role
const updateRole = async (
  userId: string,
  role: UserRole,
  currentUser: TCurrentUser,
): Promise<TUpdateRoleResponseDto> => {
  const userToUpdateRole = await userRepository.findActiveUserById(userId);
  if (!userToUpdateRole) {
    throw new NotFoundError("User does not exist");
  }
  if (role !== "ADMIN" && role !== "USER") {
    throw new BadRequestError("Invalid Role value."); 
  }
  if (userToUpdateRole.id === currentUser.id) {
    throw new BadRequestError("A Super Admin cannot change their own role."); 
  }

  const updatedUser = await userRepository.updateUserRole(userId, role);

  return {
    message: "User role successfully changed.", 
    role: updatedUser.role as "ADMIN" | "USER",
  };
};

// Update user password
const updatePassword = async (
  userId: string,
  passwordData: TUpdatePasswordDto,
  currentUser: TCurrentUser,
): Promise<TUpdatePasswordResponseDto> => {
  if (userId !== currentUser.id) {
    throw new BadRequestError("You can only change your own password."); 
  }

  if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
    throw new BadRequestError("The passwords do not match."); 
  }

  if (passwordData.newPassword.length < 8) {
    throw new BadRequestError("The password must be at least 8 characters long."); 
  }

  const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

  await userRepository.updatePassword(userId, hashedPassword);

  return {
    message: "Password successfully changed.", 
  };
};

// Retrieve list of company users
const getUsersByCompany = async (
  currentUser: TCurrentUser,
  query: TGetUsersQueryDto,
): Promise<TGetUsersResponseDto> => {
  const limit = Number(query.limit) || 5;

  const result = await userRepository.findUsersByCompanyId(currentUser.companyId, query.name, query.cursor, limit);

  let hasPrev = false;
  if (query.cursor) {
    hasPrev = await userRepository.hasPreviousPage(currentUser.companyId, query.cursor, query.name);
  }

  const prevCursor = result.users.length > 0 ? result.users[0].id : undefined;

  return {
    message: query.name ? `Search results for "${query.name}".` : "Company user list retrieval complete.", 
    users: result.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "USER",
    })),
    pagination: {
      hasNext: result.hasNext,
      hasPrev: hasPrev,
      nextCursor: result.nextCursor,
      prevCursor: hasPrev ? prevCursor : undefined,
    },
  };
};

// My info + cart count
const getMe = async (userId: string) => {
  const user = await userRepository.findUserWithCompanyById(userId);
  if (!user) {
    throw new NotFoundError("User information could not be found. Please log in again."); 
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    company: {
      id: user.company.id,
      name: user.company.name,
    },
  };
};

export default { deleteUser, updateRole, updatePassword, getUsersByCompany, getUserInfo, getMe };
