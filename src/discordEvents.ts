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
discordClient.on(Events.GuildMemberAdd, (member: GuildMember) => {
    const userId = member.user.id;
    
    // Skip if user is currently being ignored to prevent spam
    if (isUserIgnored(userId)) return;

    const joinNotificationMessage = [
        '*New user joined!*',
        `👤 *Tag*: ${member.user.tag}`,
        `🆔 *ID*: ${userId}`,
        `📅 *Joined*: ${new Date().toLocaleString()}`
    ].join('\n');

    void sendMessageToTelegram(joinNotificationMessage, Events.GuildMemberAdd, { parse_mode: 'Markdown' });
    addUserToIgnoreList(userId);
});

/**
 * Handler for voice state changes (join/leave/move voice channels)
 * Sends detailed notifications for voice channel activity.
 */
discordClient.on(Events.VoiceStateUpdate, (oldState: VoiceState, newState: VoiceState) => {
    const member = newState.member ?? oldState.member;
    if (!member) return;

    const userId = member.user.id;
    if (isUserIgnored(userId)) return;

    const displayName = member.user.globalName ?? member.user.username;
    const serverName = newState.guild?.name ?? oldState.guild?.name;

    const userJoined = !oldState.channelId && newState.channelId;
    const userLeft = oldState.channelId && !newState.channelId;
    const userMoved = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

    let notificationMessage = '';
    let eventType = '';

    if (userJoined && newState.channel) {
        const memberCount = newState.channel.members.size;
        notificationMessage = `*${displayName}* joined voice channel *${newState.channel.name}* in *${serverName}*.\n👥 There are now ${memberCount} user(s) in the channel.`;
        eventType = 'voiceJoin';
        startVoiceSession(userId, newState.channelId as string);

    } /*else if (userLeft && oldState.channel) {
        const memberCount = oldState.channel.members.size;
        notificationMessage = `*${displayName}* left voice channel *${oldState.channel.name}* in *${serverName}*.\n👥 There are ${memberCount} user(s) remaining.`;
        eventType = 'voiceLeave';
        endVoiceSession(userId);

    } *//*else if (userMoved && oldState.channel && newState.channel) {
        const newMemberCount = newState.channel.members.size;
        notificationMessage = `*${displayName}* moved from *${oldState.channel.name}* to *${newState.channel.name}* in *${serverName}*.\n👥 *${newState.channel.name}* now has ${newMemberCount} user(s).`;
        eventType = 'voiceMove';
        // The session continues, but we update the channel
        startVoiceSession(userId, newState.channelId as string);
    }*/

    if (notificationMessage) {
        sendMessageToTelegram(notificationMessage, eventType, { parse_mode: 'Markdown' })
            .catch(error => console.error(`Failed to send voice notification for ${displayName}`, error));
        addUserToIgnoreList(userId);
    }
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
discordClient.on(Events.Error, (error: Error) => {
    console.error('❌ Discord client error:', error.message);
});