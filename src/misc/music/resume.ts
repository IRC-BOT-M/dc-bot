import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, MessageFlags } from 'discord.js';
import { queues } from '../../musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resume playback');

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
  const queue = queues.get(interaction.guildId!);
  if (!queue) {
    return interaction.reply({
      content: '❌ Nothing is playing right now.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  const resumed = queue.resume();
  return interaction.reply({
    content: resumed ? '▶️ Resumed playback.' : '❌ Could not resume.',
  });
}