import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, MessageFlags } from 'discord.js';
import { queues } from '../../musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Display the current music queue');

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
  const queue = queues.get(interaction.guildId!);
  if (!queue || queue.getQueue().length === 0) {
    return interaction.reply({
      content: '🎶 The queue is currently empty.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  const tracks = queue.getQueue();
  const queueList = tracks
    .map((track, i) => `${i + 1}. **${track.title}** (${track.duration}s) — requested by *${track.requestedBy}*`)
    .join('\n');

  return interaction.reply({
    content: `🎵 **Upcoming Tracks:**\n${queueList}`,
  });
}