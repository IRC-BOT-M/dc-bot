import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { updatePoints, logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('removepoints')
  .setDescription('Remove moderation points from a user.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to remove points from')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('points')
      .setDescription('Number of points to remove (allowed: 1, 2, or 4)')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for removing points')
      .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('ManageGuild')) {
    return interaction.reply({ content: "You don't have permission to remove points.", flags: [MessageFlags.Ephemeral] });
  }
  const targetUser = interaction.options.getUser('target');
  if (!targetUser) {
    return interaction.reply({ content: "Could not find the target user.", flags: [MessageFlags.Ephemeral] });
  }
  const points = interaction.options.getInteger('points');
  if (points === null || ![1, 2, 4].includes(points)) {
    return interaction.reply({ content: "Points value must be 1, 2, or 4.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.getString('reason');
  try {
    const newTotal = await updatePoints(targetUser.id, -points);
    await logAction('Remove Points', targetUser.id, `Removed ${points} point(s). Reason: ${reason}`);
    interaction.reply({ content: `Removed ${points} points from ${targetUser.tag}. New total: ${newTotal}` });
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Failed to remove points.", flags: [MessageFlags.Ephemeral] });
  }
}