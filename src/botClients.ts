import { Client } from 'discord.js';
import { GatewayIntentBits } from 'discord-api-types/v10';
import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';

/**
 * Discord client instance configured with necessary intents for:
 * - Guild information access
 * - Voice state monitoring
 * - Member join/leave events
 */
export const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Access to guild information
        GatewayIntentBits.GuildVoiceStates, // Monitor voice channel activity
        GatewayIntentBits.GuildMembers      // Track member join/leave events
    ]
});

/**
 * Telegram bot instance configured with polling to receive updates
 * Used for sending notifications and handling commands
 */
export const telegramBot = new TelegramBot(config.telegramToken, { polling: true });

/**
 * Configure Telegram bot to show available commands in the menu
 * This enables users to see available commands when interacting with the bot
 */
void telegramBot.setChatMenuButton({ 
    menu_button: { type: 'commands' } 
});