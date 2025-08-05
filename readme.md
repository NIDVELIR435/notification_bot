# Notification Bot

## Overview
This project is a Node.js-based bot that integrates Discord and Telegram to send notifications about specific events occurring on a Discord server. The bot monitors when users join the server or connect to voice channels and relays these events to a specified Telegram chat.

## Features
- **Discord Server Monitoring**: Tracks when new members join the Discord server.
- **Voice Channel Activity**: Sends notifications when users join voice channels.
- **Ignore Mechanism**: Temporarily ignores users for a set duration (according to the IGNORE_USERS_DURATION_IN_MILISECONDS) to prevent spam.
- **Error Handling**: Logs errors for both Discord and Telegram interactions to ensure reliability.

## Prerequisites
- **Node.js**: Version 16 or higher.
- **Discord Bot Token**: Obtain from the [Discord Developer Portal](https://discord.com/developers/applications).
- **Telegram Bot Token**: Obtain from [BotFather](https://t.me/BotFather) on Telegram.
- **Telegram Chat ID**: The ID of the Telegram chat where notifications will be sent.

## Installation
1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd notification_bot
   ```
2. Install dependencies:
   ```bash
   yarn
   ```
3. Create a `.env` file in the project root and add the following:
   ```
   DISCORD_BOT_TOKEN=your_discord_bot_token
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   IGNORE_USERS_DURATION_IN_MILISECONDS=300000
   ```
4. Start the bot:
   ```bash
   yarn start
   ```

## Usage
- Ensure the bot has the necessary permissions in your Discord server (e.g., view channels, read member information).
- The bot will log in to Discord and start polling Telegram for messages.
- Notifications for new member joins and voice channel activity will be sent to the configured Telegram chat.
- Users are ignored for 5 minutes after an event to prevent duplicate notifications.

## Dependencies
- `discord.js`: For interacting with the Discord API.
- `node-telegram-bot-api`: For sending messages to Telegram.
- `dotenv`: For loading environment variables.
- `express`: Included but not currently used in the bot logic.

## Project Structure
- `index.js`: Main bot script handling Discord and Telegram integration.
- `.env`: Environment variables for tokens and chat ID (not tracked in version control).
- `package.json`: Project metadata and dependencies.

## Error Handling
- Discord client errors and Telegram polling errors are logged to the console.
- Failed Telegram message sends are caught and logged without interrupting the bot.

## Future Improvements
- Add notifications for users leaving voice channels (currently commented out in the code).
- Implement a configuration file for customizable ignore durations or message formats.
- Add support for additional Discord events (e.g., message reactions, role changes).

## License
This project is private and not licensed for public use.