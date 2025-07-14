import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageFlags } from 'discord.js';
import { removeStrike, logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('removestrike')
  .setDescription('Remove a strike from a user (overruling the punishment).')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to remove a strike from')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for removing the strike')
      .setRequired(true));

import { ChatInputCommandInteraction } from 'discord.js';

export async function execute(interaction: CommandInteraction) {
  const chatInteraction = interaction as ChatInputCommandInteraction;
  if (!chatInteraction.memberPermissions?.has('ManageGuild')) {
    return chatInteraction.reply({ content: "You don't have permission to remove strikes.", flags: [MessageFlags.Ephemeral] });
  }
  const targetUser = chatInteraction.options.getUser("target");
  if (!targetUser) {
    return chatInteraction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = chatInteraction.options.getString("reason");
  if (!reason) {
    return chatInteraction.reply({ content: "Please specify a reason for removing the strike.", flags: [MessageFlags.Ephemeral] });
  }
  try {
    const result = await removeStrike(targetUser.id, reason);
    await logAction('Remove Strike', targetUser.id, `Strike removed (overruled). Reason: ${reason}`);
    chatInteraction.reply({ content: `Strike removed for ${targetUser.tag}. ${result.message}` });
  } catch (err) {
    console.error(err);
    chatInteraction.reply({ content: "Failed to remove strike.", flags: [MessageFlags.Ephemeral] });
  }
}