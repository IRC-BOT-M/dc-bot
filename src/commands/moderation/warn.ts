import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a user.')
  .addUserOption(option => option.setName('target').setDescription('User to warn').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for warning').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('ManageGuild'))
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = interaction.options.getUser("target");
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.getString("reason");
  try {
    await logAction('Warn', targetUser.id, `Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} warned.`});
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Failed to warn user.", flags: [MessageFlags.Ephemeral] });
  }
}