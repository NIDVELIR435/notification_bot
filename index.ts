require('dotenv').config();
import {Client, Events} from 'discord.js';
import {GatewayIntentBits} from 'discord-api-types/v10';
import TelegramBot from 'node-telegram-bot-api';

const discordToken = process.env.DISCORD_BOT_TOKEN as unknown as string;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN as unknown as string;
const telegramChatId = Number(process.env.TELEGRAM_CHAT_ID) as unknown as number;
const ignoreUsersDelayInMilliseconds = process.env.IGNORE_USERS_DURATION_IN_MILISECONDS as unknown as number;

// Map to store ignored users and their timestamps
const ignoredUsers = new Map();
// Map to track voice activity (user ID -> { startTime, totalTime, currentChannel })
const voiceActivity = new Map();

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const telegramBot = new TelegramBot(telegramToken, {polling: true});

void telegramBot.setChatMenuButton({ menu_button: {type: 'commands'}})

const sendMessageToTelegram = async (message: string, type: string, options = {}) => {
    void telegramBot.sendMessage(telegramChatId, message, options).catch((error: any) => {
        console.error(`Error sending Telegram message (${type}):`, error.message);
    });
};

// Check if user is ignored
const isUserIgnored = (userId: unknown) => {
    const ignoredUntil = ignoredUsers.get(userId);
    if (!ignoredUntil) return false;

    if (Date.now() > ignoredUntil) {
        ignoredUsers.delete(userId);
        return false;
    }
    return true;
};

// Add user to ignore list
const addUserToIgnoreList = (userId: unknown) => {
    ignoredUsers.set(userId, Date.now() + ignoreUsersDelayInMilliseconds);
};

// Format time in seconds to a readable string (e.g., "2h 30m 15s")
const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${secs}s`;
};

// Telegram command handlers
telegramBot.onText(/\/help/, async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== telegramChatId) return;
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

// Telegram command handlers
telegramBot.onText(/\/serverinfo/, async (msg: TelegramBot.Message) => {
    if (msg.chat.id !== telegramChatId) return; // Restrict to authorized chat
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
    if (msg.chat.id !== telegramChatId) return; // Restrict to authorized chat
    const guild = discordClient.guilds.cache.first();
    if (!guild) {
        void sendMessageToTelegram('No Discord server found.', 'voicesummary');
        return;
    }
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

const guildMemberAddEventName = 'guildMemberAdd';
discordClient.on(guildMemberAddEventName, (member) => {
    if (isUserIgnored(member.user.id)) return;

    const message = `*New user joined!*\n👤 *Tag*: ${member.user.tag}\n🆔 *ID*: ${member.user.id}\n📅 *Joined*: ${new Date().toLocaleString()}`;
    void sendMessageToTelegram(message, guildMemberAddEventName, {parse_mode: 'Markdown'});
    addUserToIgnoreList(member.user.id);
});

const voiceStateUpdateEventName = 'voiceStateUpdate';
discordClient.on(voiceStateUpdateEventName, (oldState, newState) => {
    const userId = newState?.member?.user?.id;
    if (isUserIgnored(userId)) return;

    const user = newState?.member?.user?.globalName ?? newState?.member?.user?.username;

    if (!oldState.channelId && newState.channelId) {
        // User joined a voice channel
        const serverName = newState?.guild?.name;
        const channelName = newState.channel?.name;
        const message = `*${user}* joined voice channel *${channelName}* in *${serverName}*!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName, {parse_mode: 'Markdown'});
        addUserToIgnoreList(userId);

        // Track voice activity
        voiceActivity.set(userId, {
            startTime: Date.now(),
            totalTime: voiceActivity.get(userId)?.totalTime || 0,
            currentChannel: newState.channelId
        });
    } /*else if (oldState.channelId && !newState.channelId) {
        // User left a voice channel
        const serverName = oldState?.guild?.name;
        const channelName = oldState.channel?.name;
        const message = `*${user}* left voice channel *${channelName}* in *${serverName}*!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName, {parse_mode: 'Markdown'});
        addUserToIgnoreList(userId);

        // Update voice activity
        const data = voiceActivity.get(userId);
        if (data && data.startTime) {
            const sessionTime = Date.now() - data.startTime;
            voiceActivity.set(userId, {
                startTime: null,
                totalTime: data.totalTime + sessionTime,
                currentChannel: null
            });
        }
    }*/
});

discordClient.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

discordClient.on('error', (error) => {
    console.error('Discord client error:', error.message);
});
telegramBot.on('polling_error', (error: any) => {
    console.error('Telegram polling error:', error.message);
});
discordClient.login(discordToken);