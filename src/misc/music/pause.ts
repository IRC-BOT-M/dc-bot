import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, MessageFlags } from 'discord.js';
import { queues } from '../../musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the current track');

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
  const queue = queues.get(interaction.guildId!);
  if (!queue) {
    return interaction.reply({
      content: '❌ Nothing is playing right now.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  const paused = queue.pause();
  return interaction.reply({
    content: paused ? '⏸️ Paused the music.' : '❌ Could not pause.',
  });
}