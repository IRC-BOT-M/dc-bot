import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('undeafen')
  .setDescription('Undeafen a user in voice channels.')
  .addUserOption(option => option.setName('target').setDescription('User to undeafen').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for undeafen').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('DeafenMembers'))
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  const targetUser = interaction.options.getUser("target");
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.getString("reason") as string | undefined;
  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return interaction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  try {
    await member.voice.setDeaf(false, reason);
    await logAction('Undeafen', targetUser.id, `Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} undeafened.`});
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Failed to undeafen user.", flags: [MessageFlags.Ephemeral] });
  }
}