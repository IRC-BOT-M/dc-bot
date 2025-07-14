import { Client, GuildMember, PartialGuildMember } from 'discord.js';
import { logAction } from '../utils/database';

export function setupLeaveLogging(client: Client) {
  client.on('guildMemberRemove', async (member: GuildMember | PartialGuildMember) => {
    if (!member.user) return;
    try {
      await logAction('User Left', member.user.id, 'Left the server');
    } catch (err) {
      console.error('Error logging leave:', err);
    }
    console.log(`🚪 ${member.user.tag} left the server.`);
  });
}