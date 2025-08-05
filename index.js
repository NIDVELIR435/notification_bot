require('dotenv').config();
const DiscordJs = require('discord.js');
const TelegramBot = require('node-telegram-bot-api');

const discordToken = process.env.DISCORD_BOT_TOKEN;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const ignoreUsersDelayInMilliseconds = process.env.IGNORE_USERS_DURATION_IN_MILISECONDS;

// Map to store ignored users and their timestamps
const ignoredUsers = new Map();

const discordClient = new DiscordJs.Client({
    intents: [
        DiscordJs.GatewayIntentBits.Guilds,
        DiscordJs.GatewayIntentBits.GuildVoiceStates,
    ]
});
const telegramBot = new TelegramBot(telegramToken, { polling: true });

const sendMessageToTelegram = async (message, type) => {
    void telegramBot.sendMessage(telegramChatId, message).catch((error) => {
        console.error(`Error sending Telegram message (${type}):`, error.message);
    });
};

// Check if user is ignored
const isUserIgnored = (userId) => {
    const ignoredUntil = ignoredUsers.get(userId);
    if (!ignoredUntil) return false;

    // Check if ignore duration has expired
    if (Date.now() > ignoredUntil) {
        ignoredUsers.delete(userId);
        return false;
    }
    return true;
};

// Add user to ignore list
const addUserToIgnoreList = (userId) => {
    ignoredUsers.set(userId, Date.now() + ignoreUsersDelayInMilliseconds);
};

const guildMemberAddEventName = 'guildMemberAdd';
discordClient.on(guildMemberAddEventName, (member) => {
    if (isUserIgnored(member.user.id)) return;

    const message = `New user ${member.user.tag} joined the Discord server!`;
    void sendMessageToTelegram(message, guildMemberAddEventName);
    addUserToIgnoreList(member.user.id);
});

const voiceStateUpdateEventName = 'voiceStateUpdate';
discordClient.on(voiceStateUpdateEventName, (oldState, newState) => {
    const userId = newState?.member?.user?.id;
    if (isUserIgnored(userId)) return;

    const user = newState?.member?.user?.globalName ?? newState?.member?.user?.username;

    if (!oldState.channelId && newState.channelId) {
        const serverName = newState?.guild?.name;
        const channelName = newState.channel.name;
        const message = `${user} joined voice channel "${channelName}" in the "${serverName}"!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName);
        addUserToIgnoreList(userId);
    } /*else if (oldState.channelId && !newState.channelId) {
        const serverName = oldState?.guild?.name;
        const channelName = oldState.channel.name;
        const message = `${user} left voice channel "${channelName}" in the "${serverName}"!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName);
    }*/
});

discordClient.once(DiscordJs.Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

discordClient.on('error', (error) => {
    console.error('Discord client error:', error.message);
});
telegramBot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error.message);
});
discordClient.login(discordToken);