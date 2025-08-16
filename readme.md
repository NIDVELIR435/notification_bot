# Discord-Telegram Notification Bot

## TODO

- compare function
- one per hour check achievement updates

## Overview

A TypeScript-based notification bot that bridges Discord and Telegram, monitoring Discord server activity and sending real-time notifications to Telegram. The bot features a modular architecture with comprehensive documentation and type safety.

## ✨ Features

- **📢 Discord Server Monitoring**: Tracks new member joins with detailed information
- **🎤 Voice Channel Activity**: Monitors and tracks voice channel usage with time statistics
- **🤖 Telegram Commands**: Interactive commands for server information and voice activity
- **⏰ Smart Ignore System**: Prevents notification spam with configurable cooldown periods
- **📊 Voice Activity Tracking**: Comprehensive voice time tracking and statistics
- **🛡️ Type Safety**: Full TypeScript implementation with proper error handling
- **📝 Comprehensive Documentation**: Well-documented code with JSDoc comments

## 🎮 Telegram Commands

- `/help` - Display all available commands
- `/serverinfo` - Show Discord server statistics (members, online users, channels)
- `/voicesummary` - Display voice activity summary for all users
- `/voicereset` - Reset all voice activity data

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
   ```

5. Start the bot:
   ```bash
   npm start
   # or for development
   npm run start:dev
   ```

## 🏗️ Project Structure

```
notification_bot/
├── src/
│   ├── config.ts           # Configuration and environment variables
│   ├── utils.ts            # Utility functions (ignore logic, time formatting)
│   ├── voiceActivity.ts    # Voice activity tracking and management
│   ├── botClients.ts       # Discord and Telegram bot initialization
│   ├── messageService.ts   # Telegram message sending functionality
│   ├── telegramCommands.ts # Telegram command handlers
│   └── discordEvents.ts    # Discord event handlers
├── index.ts                # Main application entry point
├── package.json            # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── .env                   # Environment variables (not in version control)
```

## 🔧 Configuration

The bot uses environment variables for configuration:

| Variable                               | Description                               | Default            |
| -------------------------------------- | ----------------------------------------- | ------------------ |
| `DISCORD_BOT_TOKEN`                    | Discord bot authentication token          | Required           |
| `TELEGRAM_BOT_TOKEN`                   | Telegram bot authentication token         | Required           |
| `TELEGRAM_CHAT_ID`                     | Target Telegram chat ID for notifications | Required           |
| `IGNORE_USERS_DURATION_IN_MILISECONDS` | Cooldown period to prevent spam           | 300000 (5 minutes) |

## 🎯 Usage

1. **Discord Setup**: Ensure the bot has necessary permissions in your Discord server:
   - View Channels
   - Read Message History
   - View Server Members
   - Connect to Voice Channels

2. **Telegram Setup**: Add the bot to your Telegram chat and note the chat ID

3. **Operation**: The bot will automatically:
   - Send notifications when new members join
   - Track voice channel activity
   - Respond to Telegram commands
   - Maintain voice activity statistics

## 📦 Dependencies

- **discord.js**: Discord API integration
- **node-telegram-bot-api**: Telegram bot functionality
- **dotenv**: Environment variable management
- **typescript**: Type safety and development
- **ts-node**: TypeScript execution for development

## 🛠️ Development

- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Dev Mode**: `npm run start:dev` - Run with hot reload
- **Type Check**: TypeScript provides compile-time type checking

## 🔍 Error Handling

- Comprehensive error logging for both Discord and Telegram interactions
- Graceful handling of API failures and network issues
- Type-safe error handling throughout the application
- Automatic retry mechanisms for failed operations

## 🚀 Future Enhancements

- [ ] Voice channel leave notifications (currently disabled)
- [ ] Customizable notification templates
- [ ] Database integration for persistent data
- [ ] Web dashboard for statistics
- [ ] Multi-server support
- [ ] Advanced voice activity analytics

## 📄 License

This project is private and not licensed for public use.
