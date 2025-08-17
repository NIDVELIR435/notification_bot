/**
 * Notification Bot - Main Entry Point
 *
 * This bot monitors Discord server activity and sends notifications to Telegram.
 * Features:
 * - New member join notifications
 * - Voice channel activity tracking
 * - Telegram commands for server info and voice statistics
 */

// ==================== MODULE IMPORTS ====================
import { config } from "./src/config";
import { discordClient, telegramBot } from "./src/botClients";
import { achievementScheduler } from "./src/achievementScheduler";

import "./src/telegramCommands";
import "./src/discordEvents";

// ==================== ERROR HANDLING ====================
telegramBot.on("polling_error", (error: Error) => {
  console.error("❌ Telegram polling error:", error.message);
});

// ==================== BOT INITIALIZATION ====================
/**
 * Start the Discord bot with the configured token
 * This will trigger the 'ready' event once successfully connected
 */
discordClient
  .login(config.discordToken)
  .then(() => {
    console.log("✅ Discord bot logged in successfully");
  })
  .catch((error: Error) => {
    console.error("❌ Failed to login to Discord:", error.message);
    process.exit(1);
  });
/**
 * Start the Achievement scheduler
 */
achievementScheduler.start();

// ==================== GRACEFUL SHUTDOWN ====================
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down bot...");
  achievementScheduler.stop();
  discordClient.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down bot...");
  achievementScheduler.stop();
  discordClient.destroy();
  process.exit(0);
});
