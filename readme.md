# Discord-Telegram Notification Bot

## Overview

A TypeScript-based notification bot that bridges Discord and Telegram, monitoring Discord server activity and sending real-time notifications to Telegram. The bot features a modular architecture with comprehensive documentation and type safety.

## ✨ Features

- **📢 Discord Server Monitoring**: Tracks new member joins with detailed information
- **🎤 Voice Channel Activity**: Monitors and tracks voice channel usage with time statistics
- **⏰ Smart Ignore System**: Prevents notification spam with configurable cooldown periods
- **🛡️ Type Safety**: Full TypeScript implementation with proper error handling
- **📝 Comprehensive Documentation**: Well-documented code with JSDoc comments

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
   ```

4. Build the project:

   ```bash
   npm run build
   # or 
   yarn build
   ```

5. Start the bot:
   ```bash
   npm start
   # or 
   yarn start
   # or for development
   npm run start:dev
   # or 
   yarn start:dev
   ```
