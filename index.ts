// Import all modules
import { config } from './src/config';
import { discordClient, telegramBot } from './src/botClients';
import './src/telegramCommands';
import './src/discordEvents';

// Error handling for Telegram bot
telegramBot.on('polling_error', (error: any) => {
    console.error('Telegram polling error:', error.message);
});

// Start the Discord bot
discordClient.login(config.discordToken);