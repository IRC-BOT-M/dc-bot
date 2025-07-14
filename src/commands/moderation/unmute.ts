import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Unmute a user in voice channels.')
  .addUserOption(option => option.setName('target').setDescription('User to unmute').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for unmute').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('MuteMembers'))
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = interaction.options.get("target")?.user;
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.get("reason")?.value as string | undefined;
  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return interaction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  const muteRole = interaction.guild?.roles.cache.find(r => r.name.toLowerCase() === 'muted');
  if (!muteRole) return interaction.reply({ content: "Muted role not found.", flags: [MessageFlags.Ephemeral] });
  try {
    await member.roles.remove(muteRole);
    await logAction('Unmute', targetUser.id, `Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} unmuted.`});
  } catch (error) {
    console.error(error);
    interaction.reply({ content: "Failed to unmute user.", flags: [MessageFlags.Ephemeral] });
  }
}