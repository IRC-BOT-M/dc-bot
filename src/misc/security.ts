import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('quarantine')
  .setDescription('Manually quarantine a user')
  .addUserOption(option => option.setName('user').setDescription('User to quarantine').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user');
  if (!user) return interaction.reply('❌ Error: User not found.');

  const member = interaction.guild?.members.cache.get(user.id);
  const quarantineRole = interaction.guild?.roles.cache.find(role => role.name === 'Quarantine');

  if (member && quarantineRole) {
    await member.roles.set([quarantineRole.id]);
    await interaction.reply(`${user.tag} has been quarantined.`);
  } else {
    await interaction.reply('Could not quarantine the user.');
  }
}