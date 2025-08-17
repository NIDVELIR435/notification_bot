# Discord-Telegram Notification Bot

## Overview

A TypeScript-based notification bot that bridges Discord and Telegram, monitoring Discord server activity and sending real-time notifications to Telegram. The bot features a modular architecture with comprehensive documentation and type safety.

## ✨ Features

- **📢 Discord Server Monitoring**: Tracks new member joins with detailed information
- **🎤 Voice Channel Activity**: Monitors and tracks voice channel usage with time statistics
- **🏆 PSN Achievement Notifications**: Automatically checks for new PlayStation trophies and sends notifications
- **🤖 Telegram Commands**: Interactive commands for server information and voice activity
- **⏰ Smart Ignore System**: Prevents notification spam with configurable cooldown periods
- **📊 Voice Activity Tracking**: Comprehensive voice time tracking and statistics
- **🗄️ SQLite Database**: Tracks sent achievements to prevent duplicate notifications
- **⏱️ Scheduled Jobs**: Configurable interval-based achievement checking
- **🛡️ Type Safety**: Full TypeScript implementation with proper error handling
- **📝 Comprehensive Documentation**: Well-documented code with JSDoc comments

## 🎮 Telegram Commands

- `/help` - Display all available commands
- `/voicesummary` - Display voice activity summary for all users
- `/trophies user1 game` - See user earned trophies for a game
- `/compare user1 user2 game` - See differences in earned trophies for a game between users.

## 🏆 PSN Achievement Notifications

The bot can monitor PlayStation Network accounts for new trophies and send notifications to a Telegram chat.

### Features:
- **Automatic Checking**: Periodically checks for new trophies for configured PSN users.
- **Real-time Notifications**: Sends a message to Telegram as soon as a new trophy is earned today.
- **Duplicate Prevention**: Uses an SQLite database to keep track of achievements that have already been sent, preventing repeat notifications.
- **Configurable**: You can set the interval for checking achievements and which PSN accounts to monitor via environment variables. You can also configure which trophy types to track (bronze, silver, gold, platinum).
- **Detailed Information**: The notification message includes:
    - Trophy type (with an emoji)
    - Player's username
    - Game title
    - Trophy name and description
    - Rarity and earned percentage
    - Exact time the trophy was earned.

## 📋 Prerequisites

- **Node.js**: Version 16 or higher
- **TypeScript**: For development and building
- **Discord Bot Token**: Obtain from the [Discord Developer Portal](https://discord.com/developers/applications)
- **Telegram Bot Token**: Obtain from [BotFather](https://t.me/BotFather) on Telegram
- **Telegram Chat ID**: The ID of the Telegram chat where notifications will be sent

## 🚀 Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd notification_bot
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the project root:

   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   IGNORE_USERS_DURATION_IN_MILISECONDS=300000
   ACHIEVEMENT_CHECK_INTERVAL_MS=300000
   PSN_TOKENS={"username1": "token1", "username2": "token2"}
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the bot:
   ```bash
   npm start
   # or for development
   npm run start:dev
   ```

## 🏗️ Project Structure
