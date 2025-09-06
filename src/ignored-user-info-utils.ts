import { config } from "./config";

/**
 * Map to store ignored users and their expiration timestamps
 * Key: user ID (string), Value: timestamp when ignore expires (number)
 */
const ignoredUsers = new Map<string, number>();

/**
 * Checks if a user is currently being ignored for notifications
 * @param userId - The Discord user ID to check
 * @returns true if the user should be ignored, false otherwise
 */
export const isUserIgnored = (userId: string | undefined): boolean => {
  if (!userId) return false;

  const ignoredUntil = ignoredUsers.get(userId);
  if (!ignoredUntil) return false;

  // If ignore period has expired, remove from map and return false
  if (Date.now() > ignoredUntil) {
    ignoredUsers.delete(userId);
    return false;
  }
  return true;
};

/**
 * Adds a user to the ignore list for the configured duration
 * @param userId - The Discord user ID to ignore
 */
export const addUserToIgnoreList = (userId: string | undefined): void => {
  if (!userId) return;

  ignoredUsers.set(userId, Date.now() + config.userIgnoreDurationMs);
};
