import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user')
  .addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true));

export async function execute(interaction: CommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('ban_reason')
    .setTitle('Provide a reason for banning');

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Reason')
    .setStyle(TextInputStyle.Paragraph);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}