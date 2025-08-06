import { Client } from 'discord.js';
import { GatewayIntentBits } from 'discord-api-types/v10';
import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';

export const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

export const telegramBot = new TelegramBot(config.telegramToken, { polling: true });

// Set up Telegram bot menu
void telegramBot.setChatMenuButton({ menu_button: { type: 'commands' } });