import { config } from "./config";
import { achievementDb } from "./database";
import { sendMessageToTelegram } from "./messageService";
import { isToday, millisecondsToSeconds, format } from "date-fns";
import { capitalize } from "lodash";
import { PSPlatformStrategy } from "./achievement-platform-strategies/ps-platform-strategy";
import { AchievementPlatformStrategy } from "./achievement-platform-strategies/achievement-platform-strategies.abstract";
import { getTrophyEmoji } from "./achievement-platform-strategies/constants/trophy-emojis.constant";

/**
 * Achievement scheduler that checks for new achievements periodically
 */
export class AchievementScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private intervalMs: number;

  private strategies: AchievementPlatformStrategy[] = [
    new PSPlatformStrategy(),
  ];

  constructor(private readonly params: { achievementCheckInterval: number }) {
    // Get interval from environment variable (default: 5 minutes)
    this.intervalMs = this.params.achievementCheckInterval;
    console.log(
      `🕐 Achievement scheduler initialized with ${millisecondsToSeconds(this.intervalMs)}s interval`,
    );
  }

  /**
   * Start the achievement checking scheduler
   */
  start(): void {
    if (this.intervalId) {
      console.log("⚠️ Achievement scheduler is already running");
      return;
    }

    console.log("🚀 Starting achievement scheduler...");

    // Run immediately on start
    this.checkForNewAchievements();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.checkForNewAchievements().finally(() =>
        achievementDb.removeOldRecords(),
      );
    }, this.intervalMs);
  }

  /**
   * Stop the achievement checking scheduler
   */
  stop(): void {
    achievementDb.close();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;

      console.log("🛑 Achievement scheduler stopped");
    }
  }

  /**
   * Check for new achievements from today for all configured users
   */
  private async checkForNewAchievements(): Promise<void> {
    console.log("🔍 Checking for new achievements...");

    const userNames = Object.keys(config.psTokens);

    for (const userName of userNames) {
      try {
        await this.checkUserAchievements(userName);
      } catch (error) {
        console.error(
          `❌ Error checking achievements for user ${userName}:`,
          error,
        );
      }
    }
  }

  /**
   * Check achievements for a specific user
   */
  private async checkUserAchievements(userName: string): Promise<void> {
    try {
      console.log(`🎮 Checking achievements for user: ${userName}`);

      const results = await Promise.all(
        this.strategies.map(async (strategy) =>
          strategy.todayLatestTrophies(userName),
        ),
      );

      for (const r of results) {
        if (r.trophies.length > 0) {
          await this.processTrophies(userName, r.trophies, r.gameTitle);
        }
      }
    } catch (error) {
      console.error(`❌ Error checking user ${userName} achievements:`, error);
    }
  }

  /**
   * Process trophies and send notifications for new ones from today
   */
  private async processTrophies(
    userName: string,
    trophies: any[],
    gameTitle: string | null,
  ): Promise<void> {
    const title = gameTitle ?? "Unknown Game Title";
    for (const trophy of trophies) {
      try {
        if (
          !config.trackAchievementTypes.includes(trophy.trophyType) ||
          !trophy.earnedDateTime ||
          !isToday(trophy.earnedDateTime)
        )
          continue;

        // Check if we've already sent this achievement
        const alreadySent = await achievementDb.isAchievementSent(
          userName,
          trophy.trophyId,
        );
        if (alreadySent) continue;

        // Send notification
        await this.sendAchievementNotification(userName, trophy, title);

        // Mark as sent
        await achievementDb.markAchievementAsSent(
          userName,
          trophy.trophyId,
          title,
          trophy.name ?? "Unknown Trophy",
          trophy.earnedDateTime,
        );

        console.log(
          `✅ Sent achievement notification: "${trophy.name}" in the game: "${title}" for ${userName}`,
        );
      } catch (error) {
        console.error(`❌ Error processing trophy ${trophy.trophyId}:`, error);
      }
    }
  }

  /**
   * Send achievement notification to Telegram
   */
  private async sendAchievementNotification(
    userName: string,
    trophy: any,
    gameTitle: string,
  ): Promise<void> {
    const trophyEmoji = getTrophyEmoji(trophy.trophyType);
    const trophyName = trophy.name || "Unknown Trophy";
    const rarityText = trophy.trophyRare ? ` (Rare: ${trophy.trophyRare})` : "";
    const earnedRate = trophy.trophyEarnedRate
      ? ` - ${trophy.trophyEarnedRate}% earned`
      : "";

    const message =
      `${trophyEmoji} *New Achievement! (${trophy.trophyType})*\n\n` +
      `👤 *Player:* ${capitalize(userName)}\n` +
      `🎮 *Game:* ${gameTitle}\n` +
      `${trophyEmoji} *Trophy:* ${trophyName}${rarityText}\n` +
      `📝 *Description:* ${trophy.details || "No description"}\n` +
      `⏰ *Earned:* ${format(new Date(trophy.earnedDateTime), "yyyy-MM-dd HH:mm:ss")}${earnedRate}`;

    await sendMessageToTelegram(message, { parse_mode: "Markdown" });
  }
}

// Export singleton instance
export const achievementScheduler = new AchievementScheduler({
  achievementCheckInterval: config.achievementCheckInterval,
});
