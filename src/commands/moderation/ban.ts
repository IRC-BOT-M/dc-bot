import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to ban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for ban')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('BanMembers')) {
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  }

  const targetUser = interaction.options.getUser("target");
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.getString("reason");
  if (reason === null) {
    return interaction.reply({ content: "Please specify a reason for the ban.", flags: [MessageFlags.Ephemeral] });
  }

  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) {
    return interaction.reply({ content: "User not found in this guild.", flags: [MessageFlags.Ephemeral] });
  }

  try {
    await member.ban({ reason });
    await logAction('Ban', targetUser.id, `Reason: ${reason}`);
    await interaction.reply({ content: `User ${targetUser.tag} has been banned.`});
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "Failed to ban user.", flags: [MessageFlags.Ephemeral] });
  }
}