import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";
import { subDays, format } from "date-fns";
import { config } from "./config";

/**
 * Database utility for tracking sent achievements to avoid duplicates
 */
export class AchievementDatabase {
  private db: sqlite3.Database;
  private dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  private dbGet: (sql: string, params?: any[]) => Promise<any>;
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

  constructor(
    private params: {
      dbPath: string;
      achievementRecordPreserveDays: number;
    },
  ) {
    const fullPath = path.resolve(this.params.dbPath);
    this.db = new sqlite3.Database(fullPath);

    // Promisify database methods
    this.dbRun = promisify(this.db.run.bind(this.db));
    this.dbGet = promisify(this.db.get.bind(this.db));
    this.dbAll = promisify(this.db.all.bind(this.db));

    this.initializeDatabase();
  }

  /**
   * Initialize database schema
   */
  private async initializeDatabase(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS sent_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        trophy_id INTEGER NOT NULL,
        game_title TEXT NOT NULL,
        trophy_name TEXT NOT NULL,
        earned_date_time TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_name, trophy_id, game_title)
      )
    `;

    try {
      await this.dbRun(createTableSQL);
      console.log("✅ Achievement database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize achievement database:", error);
      throw error;
    }
  }

  /**
   * Check if an achievement has already been sent
   */
  async isAchievementSent(
    userName: string,
    trophyId: number,
  ): Promise<boolean> {
    try {
      const result = await this.dbGet(
        "SELECT id FROM sent_achievements WHERE user_name = ? AND trophy_id = ?",
        [userName, trophyId],
      );
      return !!result;
    } catch (error) {
      console.error("❌ Error checking if achievement was sent:", error);
      return false;
    }
  }

  /**
   * Mark an achievement as sent
   */
  async markAchievementAsSent(
    userName: string,
    trophyId: number,
    gameTitle: string,
    trophyName: string,
    earnedDateTime: string,
  ): Promise<void> {
    try {
      await this.dbRun(
        "INSERT OR IGNORE INTO sent_achievements (user_name, trophy_id, game_title, trophy_name, earned_date_time) VALUES (?, ?, ?, ?, ?)",
        [userName, trophyId, gameTitle, trophyName, earnedDateTime],
      );
    } catch (error) {
      console.error("❌ Error marking achievement as sent:", error);
      throw error;
    }
  }

  /**
   * Get all sent achievements for debugging
   */
  async getAllSentAchievements(): Promise<any[]> {
    try {
      return await this.dbAll(
        "SELECT * FROM sent_achievements ORDER BY sent_at DESC",
      );
    } catch (error) {
      console.error("❌ Error getting sent achievements:", error);
      return [];
    }
  }

  /**
   * Remove old records from the database
   */
  async removeOldRecords(): Promise<void> {
    const sevenDaysAgo = subDays(
      new Date(),
      this.params.achievementRecordPreserveDays,
    );
    const formattedDate = format(sevenDaysAgo, "yyyy-MM-dd HH:mm:ss");

    try {
      await this.dbRun(`DELETE FROM sent_achievements WHERE sent_at < ?`, [
        formattedDate,
      ]);
      console.log(
        `✅ Old records for "sent_achievements" table, before ${formattedDate} removed successfully`,
      );
    } catch (error) {
      console.error("❌ Error removing old records:", error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err);
      } else {
        console.log("✅ Database connection closed");
      }
    });
  }
}

// Export singleton instance
export const achievementDb = new AchievementDatabase({
  dbPath: "achievements.db",
  achievementRecordPreserveDays: config.achievementRecordPreserveDays,
});
