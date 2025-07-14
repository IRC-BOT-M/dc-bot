import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mute a user in voice channels.')
  .addUserOption(option => option.setName('target').setDescription('User to mute').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for mute').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('MuteMembers'))
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = interaction.options.getUser("target");
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.getString("reason") as string | undefined;
  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return interaction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  const muteRole = interaction.guild?.roles.cache.find(r => r.name.toLowerCase() === 'muted');
  if (!muteRole) return interaction.reply({ content: "Muted role not found.", flags: [MessageFlags.Ephemeral] });
  try {
    await member.roles.add(muteRole);
    await logAction('Mute', targetUser.id, `Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} muted.`});
  } catch (error) {
    console.error(error);
    interaction.reply({ content: "Failed to mute user.", flags: [MessageFlags.Ephemeral] });
  }
}