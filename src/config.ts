require("dotenv").config();

/**
 * Application configuration loaded from environment variables
 */
export interface AppConfig {
  /** Discord bot token for authentication */
  discordToken: string;
  /** Telegram bot token for authentication */
  telegramToken: string;
  /** Telegram chat ID where notifications will be sent */
  telegramChatId: number;
  /** Duration in milliseconds to ignore repeated user events (default: 5 minutes) */
  userIgnoreDurationMs: number;
  psTokens: { [Key in string]: string };
}

/**
 * Configuration object containing all application settings
 */
export const config: AppConfig = {
  discordToken: process.env.DISCORD_BOT_TOKEN as string,
  telegramToken: process.env.TELEGRAM_BOT_TOKEN as string,
  telegramChatId: Number(process.env.TELEGRAM_CHAT_ID) as number,
  userIgnoreDurationMs:
    Number(process.env.IGNORE_USERS_DURATION_IN_MILISECONDS) ?? 300000,
  psTokens: JSON.parse(process.env.PSN_TOKENS ?? ""),
};
