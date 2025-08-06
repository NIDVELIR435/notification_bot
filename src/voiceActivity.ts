/**
 * Interface representing voice activity data for a user
 */
export interface VoiceActivityData {
    /** Timestamp when the current voice session started (null if not in voice) */
    startTime: number | null;
    /** Total accumulated time spent in voice channels (in milliseconds) */
    totalTime: number;
    /** ID of the current voice channel (null if not in voice) */
    currentChannel: string | null;
}

/**
 * Map to track voice activity for each user
 * Key: user ID (string), Value: voice activity data
 */
const voiceActivity = new Map<string, VoiceActivityData>();

/**
 * Gets the voice activity map for external access
 * @returns The voice activity map containing all user data
 */
export const getVoiceActivity = (): Map<string, VoiceActivityData> => voiceActivity;

/**
 * Starts a new voice session for a user
 * @param userId - The Discord user ID
 * @param channelId - The voice channel ID the user joined
 */
export const startVoiceSession = (userId: string, channelId: string): void => {
    const existingData = voiceActivity.get(userId);
    
    voiceActivity.set(userId, {
        startTime: Date.now(),
        totalTime: existingData?.totalTime || 0,
        currentChannel: channelId
    });
};

/**
 * Ends the current voice session for a user and updates their total time
 * @param userId - The Discord user ID
 */
export const endVoiceSession = (userId: string): void => {
    const data = voiceActivity.get(userId);
    
    if (data && data.startTime) {
        const sessionDuration = Date.now() - data.startTime;
        
        voiceActivity.set(userId, {
            startTime: null,
            totalTime: data.totalTime + sessionDuration,
            currentChannel: null
        });
    }
};

/**
 * Clears all voice activity data for all users
 */
export const resetVoiceActivity = (): void => {
    voiceActivity.clear();
};