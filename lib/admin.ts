import { auth } from "@clerk/nextjs/server"

const adminIds = [
  "user_2l08XvmEFjhsWXoinR85qWJDC5V",
  "user_2l009DieKkrHKqJjeTs5iNwdIAO"
];

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
