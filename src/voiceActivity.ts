// Map to track voice activity (user ID -> { startTime, totalTime, currentChannel })
const voiceActivity = new Map();

export const getVoiceActivity = () => voiceActivity;

export const startVoiceSession = (userId: string, channelId: string) => {
    voiceActivity.set(userId, {
        startTime: Date.now(),
        totalTime: voiceActivity.get(userId)?.totalTime || 0,
        currentChannel: channelId
    });
};

export const endVoiceSession = (userId: string) => {
    const data = voiceActivity.get(userId);
    if (data && data.startTime) {
        const sessionTime = Date.now() - data.startTime;
        voiceActivity.set(userId, {
            startTime: null,
            totalTime: data.totalTime + sessionTime,
            currentChannel: null
        });
    }
};

export const resetVoiceActivity = () => {
    voiceActivity.clear();
};