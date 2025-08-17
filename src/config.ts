import { TrophyType } from "psn-api/src/models/trophy-type.model";

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
  achievementCheckInterval: number;
  achievementRecordPreserveDays: number;
  trackAchievementTypes: TrophyType[];
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
  achievementCheckInterval:
    Number(process.env.ACHIEVEMENT_CHECK_INTERVAL_MS) || 5 * 60 * 1000,
  achievementRecordPreserveDays: Number(
    process.env.ACHIEVEMENT_RECORD_PRESERVE_DAYS,
  ),
  trackAchievementTypes: process.env.TRACK_ACHIEVEMENT_TYPES!.split(
    ",",
  ) as TrophyType[],
};
