import TelegramBot from 'node-telegram-bot-api';
import { telegramBot, discordClient } from './botClients';
import { config } from './config';
import { sendMessageToTelegram } from './messageService';
import { getVoiceActivity, resetVoiceActivity } from './voiceActivity';
import { formatDuration } from './utils';

// Telegram command handlers
telegramBot.onText(/\/help/, async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== config.telegramChatId) return;
    const commands = [
        {name: '/serverinfo', description: 'Show Discord server details (members, online users, channels).'},
        {name: '/voicesummary', description: 'Display voice activity summary for users.'},
        {name: '/voicereset', description: 'Reset voice activity data'},
    ];
    let message = '📚 Available Commands \n';
    commands.forEach(cmd => {
        message += `${cmd.name}: ${cmd.description}\n`;
    });

    await sendMessageToTelegram(message, 'help', {parse_mode: 'Markdown'});
});

telegramBot.onText(/\/serverinfo/, async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== config.telegramChatId) return; // Restrict to authorized chat
    const guild = discordClient.guilds.cache.first();
    if (!guild) {
        void sendMessageToTelegram('No Discord server found.', 'serverinfo');
        return;
    }
    const memberCount = guild.memberCount;
    const onlineCount = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const channels = guild.channels.cache.size;
    const message = `*Server Info: ${guild.name}*\n👥 Members: ${memberCount}\n🟢 Online: ${onlineCount}\n📚 Channels: ${channels}`;
    void sendMessageToTelegram(message, 'serverinfo', {parse_mode: 'Markdown'});
});

telegramBot.onText(/\/voicesummary/, async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== config.telegramChatId) return; // Restrict to authorized chat
    const guild = discordClient.guilds.cache.first();
    if (!guild) {
        void sendMessageToTelegram('No Discord server found.', 'voicesummary');
        return;
    }
    const voiceActivity = getVoiceActivity();
    let message = '*Voice Activity Summary*\n';
    if (voiceActivity.size === 0) {
        message += 'No voice activity recorded.';
    } else {
        for (const [userId, data] of voiceActivity) {
            const user = guild.members.cache.get(userId)?.user;
            if (!user) continue;
            const totalTime = Math.floor((data.totalTime + (data.startTime ? Date.now() - data.startTime : 0)) / 1000);
            const currentChannel = data.currentChannel ? `<#${data.currentChannel}>` : 'Not in voice';
            message += `👤 *${user.globalName || user.username}*: ${formatDuration(totalTime)} (${currentChannel})\n`;
        }
    }
    void sendMessageToTelegram(message, 'voicesummary', {parse_mode: 'Markdown'});
});

telegramBot.onText(/\/voicereset/, async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== config.telegramChatId) return; // Restrict to authorized chat
    resetVoiceActivity();
    void sendMessageToTelegram('Voice activity data has been reset.', 'voicereset', {parse_mode: 'Markdown'});
});