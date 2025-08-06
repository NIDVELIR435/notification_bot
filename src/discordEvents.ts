import { Events } from 'discord.js';
import { discordClient } from './botClients';
import { sendMessageToTelegram } from './messageService';
import { isUserIgnored, addUserToIgnoreList } from './utils';
import { startVoiceSession } from './voiceActivity';

const guildMemberAddEventName = 'guildMemberAdd';
discordClient.on(guildMemberAddEventName, (member) => {
    if (isUserIgnored(member.user.id)) return;

    const message = `*New user joined!*\n👤 *Tag*: ${member.user.tag}\n🆔 *ID*: ${member.user.id}\n📅 *Joined*: ${new Date().toLocaleString()}`;
    void sendMessageToTelegram(message, guildMemberAddEventName, {parse_mode: 'Markdown'});
    addUserToIgnoreList(member.user.id);
});

const voiceStateUpdateEventName = 'voiceStateUpdate';
discordClient.on(voiceStateUpdateEventName, (oldState, newState) => {
    const userId = newState?.member?.user?.id;
    if (isUserIgnored(userId)) return;

    const user = newState?.member?.user?.globalName ?? newState?.member?.user?.username;

    if (!oldState.channelId && newState.channelId) {
        // User joined a voice channel
        const serverName = newState?.guild?.name;
        const channelName = newState.channel?.name;
        const message = `*${user}* joined voice channel *${channelName}* in *${serverName}*!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName, {parse_mode: 'Markdown'});
        addUserToIgnoreList(userId);

        // Track voice activity
        startVoiceSession(userId!, newState.channelId);
    } /*else if (oldState.channelId && !newState.channelId) {
        // User left a voice channel
        const serverName = oldState?.guild?.name;
        const channelName = oldState.channel?.name;
        const message = `*${user}* left voice channel *${channelName}* in *${serverName}*!`;
        void sendMessageToTelegram(message, voiceStateUpdateEventName, {parse_mode: 'Markdown'});
        addUserToIgnoreList(userId);

        // Update voice activity
        endVoiceSession(userId!);
    }*/
});

discordClient.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

discordClient.on('error', (error) => {
    console.error('Discord client error:', error.message);
});