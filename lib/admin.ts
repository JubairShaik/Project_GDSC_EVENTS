import { auth } from "@clerk/nextjs/server"

const adminIds = [
  "user_2j9IhujmrxX1Cfcl5Pa28e6pswo",
];

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
