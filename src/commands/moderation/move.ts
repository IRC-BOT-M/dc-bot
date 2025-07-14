import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, VoiceChannel, GuildMember, ChannelType, MessageFlags } from 'discord.js';
import { logAction } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('move')
  .setDescription('Move a user between voice channels.')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('User to move')
      .setRequired(true))
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('Voice channel to move the user to')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('reason')
      .setDescription('Reason for moving the user')
      .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('MoveMembers')) {
    return interaction.reply({ content: "You don't have permission to move members.", flags: [MessageFlags.Ephemeral] });
  }
  const targetUser = interaction.options.get("target")?.user;
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const member = interaction.guild?.members.cache.get(targetUser.id) as GuildMember;
  if (!member || !member.voice.channel) {
    return interaction.reply({ content: "The target user is not in a voice channel.", flags: [MessageFlags.Ephemeral] });
  }
  const channelOption = interaction.options.get("channel")?.channel;
  if (!channelOption || channelOption.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: "The specified channel is not a voice channel.", flags: [MessageFlags.Ephemeral] });
  }
  const targetVoiceChannel = channelOption as VoiceChannel;
  const reason = interaction.options.get("reason")?.value as string | undefined;
  try {
    await member.voice.setChannel(targetVoiceChannel, reason);
    await logAction('Move', targetUser.id, `Moved to ${targetVoiceChannel.name} | Reason: ${reason}`);
    interaction.reply({ content: `User ${targetUser.tag} has been moved to ${targetVoiceChannel.name}.\nReason: ${reason}` });
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Failed to move the user.", flags: [MessageFlags.Ephemeral] });
  }
}