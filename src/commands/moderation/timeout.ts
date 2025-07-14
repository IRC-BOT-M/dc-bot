import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Timeout a user from text channels.')
  .addUserOption(option => option.setName('target').setDescription('User to timeout').setRequired(true))
  .addIntegerOption(option => option.setName('duration').setDescription('Duration in minutes').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for timeout').setRequired(true));

import { ChatInputCommandInteraction } from 'discord.js';

export async function execute(interaction: CommandInteraction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  if (!chatInteraction.memberPermissions?.has('ModerateMembers'))
    return chatInteraction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = chatInteraction.options.getUser("target");
  if (!targetUser) {
    return chatInteraction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const duration = chatInteraction.options.getInteger("duration");
  const reason = chatInteraction.options.getString("reason");
  const member = chatInteraction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return chatInteraction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  if (duration === null || duration === undefined) {
    return chatInteraction.reply({ content: "Please specify a valid duration.", flags: [MessageFlags.Ephemeral] });
  }
  try {
    await member.timeout(duration * 60 * 1000, reason ?? undefined);
    await logAction('Timeout', targetUser.id, `Duration: ${duration} minutes, Reason: ${reason}`);
    chatInteraction.reply({ content: `User ${targetUser.tag} timed out for ${duration} minutes.`});
  } catch (error) {
    console.error(error);
    chatInteraction.reply({ content: "Failed to timeout user.", flags: [MessageFlags.Ephemeral] });
  }
}