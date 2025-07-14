import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction, clearQuarantineRecord } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('unquarantine')
  .setDescription('Un-quarantine a user and restore roles.')
  .addUserOption(option => option.setName('target').setDescription('User to unquarantine').setRequired(true))
  .addBooleanOption(option => option.setName('no_strike').setDescription('Do not add a strike').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for unquarantine').setRequired(true));

import { ChatInputCommandInteraction } from 'discord.js';

export async function execute(interaction: CommandInteraction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  if (!chatInteraction.memberPermissions?.has('ManageGuild'))
    return chatInteraction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = chatInteraction.options.getUser("target");
  if (!targetUser) {
    return chatInteraction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const noStrike = chatInteraction.options.getBoolean("no_strike") ?? undefined;
  const reason = chatInteraction.options.getString("reason") ?? undefined;
  const member = chatInteraction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return chatInteraction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  try {
    const previousRoles = await clearQuarantineRecord(targetUser.id);
    if (!previousRoles || previousRoles.length === 0)
      return interaction.reply({ content: "No previous roles recorded for this user.", flags: [MessageFlags.Ephemeral] });
    await member.roles.set(previousRoles);
    await logAction('Unquarantine', targetUser.id, `Reason: ${reason}. No Strike: ${noStrike}`);
    interaction.reply({ content: `User ${targetUser.tag} unquarantined.`});
  } catch (error) {
    console.error(error);
    interaction.reply({ content: "Failed to unquarantine user.", flags: [MessageFlags.Ephemeral] });
  }
}