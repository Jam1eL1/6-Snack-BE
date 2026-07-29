export type UserRole = "ADMIN" | "USER";

// Delete user
export type TDeleteUserResponseDto = {
  message: string;
};

// Update user role request
export type TUpdateRoleDto = {
  role: UserRole;
};

// Update user role response
export type TUpdateRoleResponseDto = {
  message: string;
  role: UserRole;
};

// Change user password request
export type TUpdatePasswordDto = {
  newPassword: string;
  newPasswordConfirm: string;
};

// Change user password response
export type TUpdatePasswordResponseDto = {
  message: string;
};

// User ID route parameters
export type TUserIdParamsDto = {
  userId: string;
};

// User profile response
export type TGetUserInfoResponseDto = {
  message: string;
  user: {
    company: {
      name: string;
    };
    name: string;
    email: string;
    role?: "ADMIN" | "SUPER_ADMIN";
  };
};

// User list query
export type TGetUsersQueryDto = {
  name?: string; // Query parameter
  cursor?: string; // Pagination cursor containing the last user ID
  limit?: number; // Number of users per page; defaults to 5
};

// User list response
export type TGetUsersResponseDto = {
  message: string;
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
  }>;
  pagination: {
    hasNext: boolean; // Whether a next page exists
    hasPrev: boolean; // Whether a previous page exists
    nextCursor?: string; // Next-page cursor
    prevCursor?: string; // Previous-page cursor
  };
};
