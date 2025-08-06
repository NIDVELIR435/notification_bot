import { telegramBot } from './botClients';
import { config } from './config';

export const sendMessageToTelegram = async (message: string, type: string, options = {}) => {
    void telegramBot.sendMessage(config.telegramChatId, message, options).catch((error: any) => {
        console.error(`Error sending Telegram message (${type}):`, error.message);
    });
};