import * as _ from "lodash";
import TelegramBot from "node-telegram-bot-api";
import { telegramBot, discordClient } from "./botClients";
import { config } from "./config";
import { sendMessageToTelegram } from "./messageService";
import { getVoiceActivity, resetVoiceActivity } from "./voiceActivity";
import { formatDuration } from "./utils";

import { TROPHY_EMOJIS } from "./psn/trophy-emojis.constant";
import { getLatestTrophies } from "./psn/psn-api";
import { formatTime } from "./utils/format-time";

/**
 * Interface for command definitions used in a help message
 */
interface CommandDefinition {
  name: string;
  description: string;
}

/**
 * Available bot commands with their descriptions
 */
const AVAILABLE_COMMANDS: CommandDefinition[] = [
  {
    name: "/voicesummary",
    description: "Display voice activity summary for users.",
  },
  {
    name: `/trophies user game`,
    description: `See user earned trophies for a game. \nUsers: [[${Object.keys(config.psTokens).join(", ")}]]`,
  },
  {
    name: `/compare user1 user2 game`,
    description: `See differences in earned trophies for a game between users. \nUsers: [[${Object.keys(config.psTokens).join(", ")}]]`,
  },
];

/**
 * Checks if the message is from the authorized chat
 * @param msg - Telegram message object
 * @returns true if authorized, false otherwise
 */
const isAuthorizedChat = (msg: TelegramBot.Message): boolean => {
  return msg.chat.id === config.telegramChatId;
};

/**
 * Gets the first Discord guild (server) that the bot is connected to
 * @returns Discord guild object or null if not found
 */
const getDiscordGuild = () => {
  return discordClient.guilds.cache.first() || null;
};

// ==================== COMMAND HANDLERS ====================
/**
 * Handler for /help command - displays available bot commands
 */
telegramBot.onText(/\/help/, async (msg: TelegramBot.Message) => {
  if (!isAuthorizedChat(msg)) return;

  let helpMessage = "📚 *Available Commands*\n\n";
  AVAILABLE_COMMANDS.forEach((cmd) => {
    helpMessage += `${cmd.name} - ${cmd.description}\n`;
  });

  await sendMessageToTelegram(helpMessage, { parse_mode: "Markdown" });
});

/**
 * Handler for /voicesummary command - displays voice activity statistics
 */
telegramBot.onText(/\/voicesummary/, async (msg: TelegramBot.Message) => {
  if (!isAuthorizedChat(msg)) return;

  const guild = getDiscordGuild();
  if (!guild) {
    await sendMessageToTelegram("❌ No Discord server found.");
    return;
  }

  const voiceStates = guild?.voiceStates.cache.filter(
    (voiceState) => voiceState.channelId,
  );
  const activeVoiceMembers = voiceStates?.size ?? 0;

  let summaryMessage = "*Voice Activity Summary*\n\n";

  if (activeVoiceMembers === 0) {
    summaryMessage += "No voice activity recorded.";
  } else {
    for (const [userId, voiceState] of voiceStates) {
      const member = guild.members.cache.get(userId);
      const user = member?.user;
      if (!user && !member) continue;

      const userDisplayName =
        member?.nickname ?? user?.globalName ?? user?.username;
      const channelName =
        guild.channels.cache.get(voiceState.channelId!)?.name ??
        "Unknown Channel";

      summaryMessage += `👤 *${userDisplayName}*: In *${channelName}*\n`;
    }
  }

  await sendMessageToTelegram(summaryMessage, { parse_mode: "Markdown" });
});

telegramBot.onText(
  /\/trophies(\s+([^\s]+)(\s+(.+))?)?/,
  async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorizedChat(msg)) return;
    const nickname = match && match[2] ? match[2].trim().toLowerCase() : null; // First word: nickname
    const searchWord = match && match[4] ? match[4].trim().toLowerCase() : null; // Second word: game name

    try {
      const { gameTitle, trophiesProgress, trophies } = await getLatestTrophies(
        nickname,
        searchWord,
      );
      if (!trophies || trophies.length === 0) {
        await sendMessageToTelegram("🏆 No trophies found.", {
          parse_mode: "Markdown",
        });
        return;
      }

      // Combine all trophies into a single message
      let message: string;

      for (const chunk of _.chunk(trophies, 20)) {
        message = `🏆 *Latest Trophies for: ${gameTitle}. Current progress: ${trophiesProgress}*\n`;
        chunk.forEach((trophy) => {
          message +=
            `${TROPHY_EMOJIS[trophy.trophyType]} *${trophy.name}* (${trophy.trophyType})\n` +
            `📜 ${trophy.details}\n` +
            `🌟 Earned Rate: ${trophy.trophyEarnedRate}%\n` +
            `⌚ Date UTC: ${formatTime(trophy.earnedDateTime!)}\n\n`;
        });

        await sendMessageToTelegram(message, { parse_mode: "Markdown" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await sendMessageToTelegram(
        `❌ Error fetching trophies: ${errorMessage}`,
        { parse_mode: "Markdown" },
      );
    }
  },
);

telegramBot.onText(
  /\/compare\s+([^\s]+)\s+([^\s]+)\s+(.+)/,
  async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    if (!isAuthorizedChat(msg)) return;

    if (!match || !match[1] || !match[2] || !match[3]) {
      await sendMessageToTelegram(
        "❌ Invalid command format. Use: `/compare user1 user2 game`",
        { parse_mode: "Markdown" },
      );
      return;
    }

    const user1 = match[1].trim().toLowerCase();
    const user2 = match[2].trim().toLowerCase();
    const gameName = match[3].trim().toLowerCase();

    try {
      // Fetch trophies for both users
      const [result1, result2] = await Promise.all([
        getLatestTrophies(user1, gameName),
        getLatestTrophies(user2, gameName),
      ]);

      const { gameTitle: title1, trophies: trophies1 } = result1;
      const { gameTitle: title2, trophies: trophies2 } = result2;

      if (
        !trophies1 ||
        trophies1.length === 0 ||
        !trophies2 ||
        trophies2.length === 0
      ) {
        await sendMessageToTelegram(
          `🏆 No trophies found for *${!trophies1 || trophies1.length === 0 ? user1 : user2}* in "${result1.gameTitle ?? result2.gameTitle ?? gameName}".`,
          { parse_mode: "Markdown" },
        );
        return;
      }

      // Ensure the game titles match (case-insensitive)
      if (title1?.toLowerCase() !== title2?.toLowerCase()) {
        await sendMessageToTelegram(
          `❌ Users are playing different games: ${title1} vs ${title2}.`,
          { parse_mode: "Markdown" },
        );
        return;
      }

      // Find trophies earned by one user but not the other
      const differences = {
        user1Only: trophies1.filter(
          (t1) => !trophies2.some((t2) => t2.name === t1.name),
        ),
        user2Only: trophies2.filter(
          (t2) => !trophies1.some((t1) => t1.name === t2.name),
        ),
      };

      // Build the comparison message
      let message = `🏆 *Trophy Comparison for ${title1}*\n\n`;

      // Trophies unique to user1
      if (differences.user1Only.length > 0) {
        message += `**${user1} has these trophies (not earned by ${user2}):**\n`;
        for (const trophy of differences.user1Only) {
          message +=
            `${TROPHY_EMOJIS[trophy.trophyType]} *${trophy.name}* [${trophy.trophyType}]\n` +
            `📜 ${trophy.details}\n` +
            `🌟 Earned Rate: ${trophy.trophyEarnedRate}%\n` +
            `⌚ Date UTC: ${formatTime(trophy.earnedDateTime!)}\n\n`;
        }
      } else {
        message += `**${user1} has no unique trophies.**\n`;
      }

      // Trophies unique to user2
      if (differences.user2Only.length > 0) {
        message += `**${user2} has these trophies (not earned by ${user1}):**\n`;
        for (const trophy of differences.user2Only) {
          message +=
            `${TROPHY_EMOJIS[trophy.trophyType]} *${trophy.name}* [${trophy.trophyType}]\n` +
            `📜 ${trophy.details}\n` +
            `🌟 Earned Rate: ${trophy.trophyEarnedRate}%\n` +
            `⌚ Date UTC: ${formatTime(trophy.earnedDateTime!)}\n\n`;
        }
      } else {
        message += `**${user2} has no unique trophies.**\n`;
      }

      // Send the message (split into chunks if needed)
      for (const chunk of _.chunk([message], 1)) {
        await sendMessageToTelegram(chunk[0], { parse_mode: "Markdown" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await sendMessageToTelegram(
        `❌ Error fetching trophies: ${errorMessage}`,
        { parse_mode: "Markdown" },
      );
    }
  },
);
