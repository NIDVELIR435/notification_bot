import { Events, GuildMember, VoiceState } from 'discord.js';
import { discordClient } from './botClients';
import { sendMessageToTelegram } from './messageService';
import { isUserIgnored, addUserToIgnoreList } from './utils';
import { startVoiceSession } from './voiceActivity';

// ==================== EVENT HANDLERS ====================

/**
 * Handler for when a new member joins the Discord server
 * Sends a notification to Telegram with member details
 */
discordClient.on('guildMemberAdd', (member: GuildMember) => {
    const userId = member.user.id;
    
    // Skip if user is currently being ignored to prevent spam
    if (isUserIgnored(userId)) return;

    const joinNotificationMessage = [
        '*New user joined!*',
        `👤 *Tag*: ${member.user.tag}`,
        `🆔 *ID*: ${userId}`,
        `📅 *Joined*: ${new Date().toLocaleString()}`
    ].join('\n');

    void sendMessageToTelegram(joinNotificationMessage, 'guildMemberAdd', { parse_mode: 'Markdown' });
    addUserToIgnoreList(userId);
});

/**
 * Handler for voice state changes (join/leave/move voice channels)
 * Currently only handles voice channel joins to track activity
 */
discordClient.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const userId = newState?.member?.user?.id;
    
    // Skip if user is currently being ignored or user ID is missing
    if (!userId || isUserIgnored(userId)) return;

    const displayName = newState?.member?.user?.globalName ?? newState?.member?.user?.username;
    const serverName = newState?.guild?.name;

    // Check if user joined a voice channel (wasn't in voice before, now is)
    const userJoinedVoiceChannel = !oldState.channelId && newState.channelId;
    
    if (userJoinedVoiceChannel && newState.channelId) {
        const channelName = newState.channel?.name;
        
        const voiceJoinMessage = `*${displayName}* joined voice channel *${channelName}* in *${serverName}*!`;
        void sendMessageToTelegram(voiceJoinMessage, 'voiceStateUpdate', { parse_mode: 'Markdown' });
        
        // Add user to ignore list to prevent spam notifications
        addUserToIgnoreList(userId);
        
        // Start tracking voice activity for this user
        startVoiceSession(userId, newState.channelId);
    }
    
    // TODO: Implement voice channel leave detection
    // Currently commented out - can be enabled if needed
    /*
    const userLeftVoiceChannel = oldState.channelId && !newState.channelId;
    if (userLeftVoiceChannel) {
        const channelName = oldState.channel?.name;
        const voiceLeaveMessage = `*${displayName}* left voice channel *${channelName}* in *${serverName}*!`;
        void sendMessageToTelegram(voiceLeaveMessage, 'voiceStateUpdate', { parse_mode: 'Markdown' });
        addUserToIgnoreList(userId);
        
        // End voice session tracking
        endVoiceSession(userId);
    }
    */
});

/**
 * Handler for when the Discord client is ready and logged in
 * Logs successful connection to console
 */
discordClient.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Discord bot ready! Logged in as ${readyClient.user.tag}`);
});

/**
 * Handler for Discord client errors
 * Logs errors to console for debugging
 */
discordClient.on('error', (error: Error) => {
    console.error('❌ Discord client error:', error.message);
});