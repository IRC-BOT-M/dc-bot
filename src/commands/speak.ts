import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ChannelType, MessageFlags } from 'discord.js';
import { logAction } from '../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('speak')
  .setDescription('Make the bot speak a message in this channel.')
  .addStringOption(option =>
    option.setName('message')
      .setDescription('Message for the bot to say')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for using the speak command')
      .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('ManageMessages')) {
    return interaction.reply({ content: "You don't have permission to use this command.", flags: [MessageFlags.Ephemeral] });
  }
  const message = interaction.options.getString('message');
  const reason = interaction.options.getString('reason');

  try {
    if (interaction.channel && interaction.channel.type === ChannelType.GuildText) {
      if (typeof message === 'string') {
        await (interaction.channel as import('discord.js').TextChannel).send(message);
        await logAction('Speak', interaction.user.id, `Message: ${message} | Reason: ${reason}`);
        interaction.reply({ content: "Message delivered!", flags: [MessageFlags.Ephemeral] });
      } else {
        interaction.reply({ content: "No message provided to send.", flags: [MessageFlags.Ephemeral] });
      }
    } else {
      interaction.reply({ content: "This command can only be used in text channels.", flags: [MessageFlags.Ephemeral] });
    }
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Failed to deliver message.", flags: [MessageFlags.Ephemeral] });
  }
}