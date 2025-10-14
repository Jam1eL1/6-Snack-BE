export const inviteMockData = [
  {
    id: "invite-1",
    email: "sarah.connor@acme.inc",
    name: "Sarah Connor",
    invitedById: "user-1", // Alex Toporowski (SUPER_ADMIN)
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)), // Expires 7 days from seeding
    isUsed: false,
    role: "USER",
  },
  {
    id: "invite-2",
    email: "john.doe@globalcorp.net",
    name: "John Doe",
    invitedById: "user-1-2", // Jamie Lee (RBC Super-Admin)
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 5)), // Expires 5 days from seeding
    isUsed: false,
    role: "USER",
  },
  {
    id: "invite-3",
    email: "jane.smith@techwave.io",
    name: "Jane Smith",
    invitedById: "user-1", // Alex Toporowski (SUPER_ADMIN) invites as Admin
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 10)), // Expires 10 days from seeding
    isUsed: false,
    role: "ADMIN",
  },

  // Validation Test Data
  // 1. Used/Accepted Invite (for a new user who has already joined)
  {
    id: "invite-4",
    email: "used.invite@zenithco.com",
    name: "Used User",
    invitedById: "user-1",
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)), // Not expired yet
    isUsed: true, // Already used
    role: "USER",
  },

  // 2. Expired Invite
  {
    id: "invite-5",
    email: "expired.link@oldco.org",
    name: "Expired User",
    invitedById: "user-2",
    expiresAt: new Date("2025-01-30"), // Expired date (kept in the past)
    isUsed: false,
    role: "USER",
  },
];
