import TelegramBot from 'node-telegram-bot-api';
import { telegramBot, discordClient } from './botClients';
import { config } from './config';
import { sendMessageToTelegram } from './messageService';
import { getVoiceActivity, resetVoiceActivity } from './voiceActivity';
import { formatDuration } from './utils';

/**
 * Interface for command definitions used in help message
 */
interface CommandDefinition {
    name: string;
    description: string;
}

/**
 * Available bot commands with their descriptions
 */
const AVAILABLE_COMMANDS: CommandDefinition[] = [
    { name: '/serverinfo', description: 'Show Discord server details (members, online users, channels).' },
    { name: '/voicesummary', description: 'Display voice activity summary for users.' },
    { name: '/voicereset', description: 'Reset voice activity data.' },
];

/**
 * Checks if the message is from the authorized chat
 * @param msg - Telegram message object
 * @returns true if authorized, false otherwise
 */
const isAuthorizedChat = (msg: TelegramBot.Message): boolean => {
    return msg.chat.id === config.telegramChatId;
};

/**
 * Gets the first Discord guild (server) that the bot is connected to
 * @returns Discord guild object or null if not found
 */
const getDiscordGuild = () => {
    return discordClient.guilds.cache.first() || null;
};

// ==================== COMMAND HANDLERS ====================

/**
 * Handler for /help command - displays available bot commands
 */
telegramBot.onText(/\/help/, async (msg: TelegramBot.Message) => {
    if (!isAuthorizedChat(msg)) return;
    
    let helpMessage = '📚 *Available Commands*\n\n';
    AVAILABLE_COMMANDS.forEach(cmd => {
        helpMessage += `${cmd.name}: ${cmd.description}\n`;
    });

    await sendMessageToTelegram(helpMessage, 'help', { parse_mode: 'Markdown' });
});

/**
 * Handler for /serverinfo command - displays Discord server information
 */
telegramBot.onText(/\/serverinfo/, async (msg: TelegramBot.Message) => {
    if (!isAuthorizedChat(msg)) return;
    
    const guild = getDiscordGuild();
    if (!guild) {
        await sendMessageToTelegram('❌ No Discord server found.', 'serverinfo');
        return;
    }

    const memberCount = guild.memberCount;
    const onlineCount = guild.members.cache.filter(member => 
        member.presence?.status === 'online'
    ).size;
    const channelCount = guild.channels.cache.size;

    const serverInfoMessage = [
        `*Server Info: ${guild.name}*`,
        `👥 Members: ${memberCount}`,
        `🟢 Online: ${onlineCount}`,
        `📚 Channels: ${channelCount}`
    ].join('\n');

    await sendMessageToTelegram(serverInfoMessage, 'serverinfo', { parse_mode: 'Markdown' });
});

/**
 * Handler for /voicesummary command - displays voice activity statistics
 */
telegramBot.onText(/\/voicesummary/, async (msg: TelegramBot.Message) => {
    if (!isAuthorizedChat(msg)) return;
    
    const guild = getDiscordGuild();
    if (!guild) {
        await sendMessageToTelegram('❌ No Discord server found.', 'voicesummary');
        return;
    }

    const voiceActivity = getVoiceActivity();
    let summaryMessage = '*Voice Activity Summary*\n\n';

    if (voiceActivity.size === 0) {
        summaryMessage += 'No voice activity recorded.';
    } else {
        for (const [userId, activityData] of voiceActivity) {
            const user = guild.members.cache.get(userId)?.user;
            if (!user) continue;

            // Calculate total time including current session if active
            const currentSessionTime = activityData.startTime ? Date.now() - activityData.startTime : 0;
            const totalTimeInSeconds = Math.floor((activityData.totalTime + currentSessionTime) / 1000);
            
            const channelStatus = activityData.currentChannel 
                ? `<#${activityData.currentChannel}>` 
                : 'Not in voice';
            
            const displayName = user.globalName || user.username;
            summaryMessage += `👤 *${displayName}*: ${formatDuration(totalTimeInSeconds)} (${channelStatus})\n`;
        }
    }

    await sendMessageToTelegram(summaryMessage, 'voicesummary', { parse_mode: 'Markdown' });
});

/**
 * Handler for /voicereset command - clears all voice activity data
 */
telegramBot.onText(/\/voicereset/, async (msg: TelegramBot.Message) => {
    if (!isAuthorizedChat(msg)) return;
    
    resetVoiceActivity();
    await sendMessageToTelegram(
        '✅ Voice activity data has been reset.', 
        'voicereset', 
        { parse_mode: 'Markdown' }
    );
});