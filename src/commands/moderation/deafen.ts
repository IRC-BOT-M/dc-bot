import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('deafen')
  .setDescription('Deafen a user in voice channels.')
  .addUserOption(option => option.setName('target').setDescription('User to deafen').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Reason for deafen').setRequired(true));

export async function execute(interaction: CommandInteraction) {
  if (!interaction.memberPermissions?.has('DeafenMembers'))
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });

  const chatInputInteraction = interaction as ChatInputCommandInteraction;
  const targetUser = chatInputInteraction.options.getUser("target");
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = chatInputInteraction.options.getString("reason") as string | undefined;
  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) return interaction.reply({ content: "User not found.", flags: [MessageFlags.Ephemeral] });
  try {
    await member.voice.setDeaf(true, reason);
    await logAction('Deafen', targetUser.id, `Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} deafened.`});
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Failed to deafen user.", flags: [MessageFlags.Ephemeral] });
  }
}