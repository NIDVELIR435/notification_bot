import { telegramBot } from './botClients';
import { config } from './config';
import { SendMessageOptions } from 'node-telegram-bot-api';

/**
 * Sends a message to the configured Telegram chat with error handling
 * @param message - The message text to send
 * @param messageType - Type/category of the message for logging purposes
 * @param options - Additional Telegram message options (parse_mode, reply_markup, etc.)
 * @returns Promise that resolves when message is sent or error is handled
 */
export const sendMessageToTelegram = async (
    message: string, 
    messageType: string, 
    options: SendMessageOptions = {}
): Promise<void> => {
    try {
        await telegramBot.sendMessage(config.telegramChatId, message, options);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error sending Telegram message (${messageType}):`, errorMessage);
    }
};