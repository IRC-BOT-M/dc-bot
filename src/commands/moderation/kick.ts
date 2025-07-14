import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a user.')
  .addUserOption(option => option.setName('target').setDescription('User to kick').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for kick').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('KickMembers'))
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = interaction.options.getUser('target', true);
  const reason = interaction.options.getString('reason', true);
  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return interaction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  try {
    await member.kick(reason);
    await logAction('Kick', targetUser.id, `Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} kicked.`});
  } catch (error) {
    console.error(error);
    interaction.reply({ content: "Failed to kick user.", flags: [MessageFlags.Ephemeral] });
  }
}