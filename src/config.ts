require('dotenv').config();

export const config = {
    discordToken: process.env.DISCORD_BOT_TOKEN as string,
    telegramToken: process.env.TELEGRAM_BOT_TOKEN as string,
    telegramChatId: Number(process.env.TELEGRAM_CHAT_ID) as number,
    ignoreUsersDelayInMilliseconds: Number(process.env.IGNORE_USERS_DURATION_IN_MILISECONDS) || 300000 // 5 minutes default
};