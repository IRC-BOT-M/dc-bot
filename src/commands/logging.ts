import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { getLogs } from '../utils/database.js';

interface Log {
  action: string;
  user_id: string;
  reason?: string;
  timestamp: number;
}

export const data = new SlashCommandBuilder()
  .setName('logs')
  .setDescription('View moderation logs');

export async function execute(interaction: CommandInteraction) {
  const logs = (await getLogs()) as Log[];
  
  if (!logs.length) {
    return interaction.reply('📜 No moderation logs found.');
  }

  let logMessage = '📝 **Moderation Logs:**\n';

  logs.forEach((log) => {
    logMessage += `\n🔹 **Action:** ${log.action}\n👤 **User:** <@${log.user_id}>\n🗒️ **Reason:** ${log.reason || 'No reason provided'}\n`;
  });

  await interaction.reply(logMessage);
}