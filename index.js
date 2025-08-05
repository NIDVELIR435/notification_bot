require('dotenv').config()
const DiscordJs = require('discord.js');
const TelegramBot = require('node-telegram-bot-api');

const discordToken = process.env.DISCORD_BOT_TOKEN;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

const discordClient = new DiscordJs.Client({
    intents: [
        DiscordJs.GatewayIntentBits.Guilds,
        DiscordJs.GatewayIntentBits.GuildVoiceStates,
    ]
});
const telegramBot = new TelegramBot(telegramToken, {polling: true});

const sendMessageToTelegram = async (message, type) => {
    // console.log({message, type});
    void telegramBot.sendMessage(telegramChatId, message).catch((error) => {
        console.error(`Error sending Telegram message (${type}):`, error.message);
    });
}

const guildMemberAddEventName = 'guildMemberAdd';
discordClient.on(guildMemberAddEventName, (member) => {
    const message = `New user ${member.user.tag} joined the Discord server!`;
    void sendMessageToTelegram(message, guildMemberAddEventName);
});


// Notify when a user joins a voice channel
const voiceStateUpdateEventName = 'voiceStateUpdate'
discordClient.on(voiceStateUpdateEventName, (oldState, newState) => {
    const user = newState?.member?.user?.globalName ?? newState?.member?.user?.username;
    // Check if user joined a voice channel (oldState has no channel, newState has a channel)
    if (!oldState.channelId && newState.channelId) {
        const serverName = newState?.guild?.name;
        const channelName = newState.channel.name;
        const message = `${user} joined voice channel "${channelName}" in the "${serverName}"!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName);
    } else if (oldState.channelId && !newState.channelId) {
        const serverName = oldState?.guild?.name;
        const channelName = oldState.channel.name;
        const message = `${user} leave voice channel "${channelName}" in the "${serverName}"!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName);
    }
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