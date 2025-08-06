import { config } from './config';

// Map to store ignored users and their timestamps
const ignoredUsers = new Map();

// Check if user is ignored
export const isUserIgnored = (userId: unknown) => {
    const ignoredUntil = ignoredUsers.get(userId);
    if (!ignoredUntil) return false;

    if (Date.now() > ignoredUntil) {
        ignoredUsers.delete(userId);
        return false;
    }
    return true;
};

// Add user to ignore list
export const addUserToIgnoreList = (userId: unknown) => {
    ignoredUsers.set(userId, Date.now() + config.ignoreUsersDelayInMilliseconds);
};

// Format time in seconds to a readable string (e.g., "2h 30m 15s")
export const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${secs}s`;
};