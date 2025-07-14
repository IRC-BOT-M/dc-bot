import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('quarantine')
  .setDescription('Manually quarantine a user.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to quarantine')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for quarantine')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('ManageGuild')) {
    return interaction.reply({ content: "Insufficient permissions.", flags: [MessageFlags.Ephemeral] });
  }

  const targetUser = interaction.options.getUser("target");
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const reason = interaction.options.getString("reason");

  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member) {
    return interaction.reply({ content: "User not found in this guild.", flags: [MessageFlags.Ephemeral] });
  }

  try {
    const quarantineRole = interaction.guild!.roles.cache.find(r => r.name === 'Quarantined');
    if (!quarantineRole) {
      return interaction.reply({ content: "Quarantine role not found.", flags: [MessageFlags.Ephemeral] });
    }

    await member.roles.set([quarantineRole.id]);
    await logAction('Quarantine', targetUser.id, `Reason: ${reason}`);
    await interaction.reply({ content: `User ${targetUser.tag} has been quarantined.`});
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "Failed to quarantine user.", flags: [MessageFlags.Ephemeral] });
  }
}