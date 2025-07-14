import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, MessageFlags } from 'discord.js';
import { queues } from '../../musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the currently playing song');

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
  const queue = queues.get(interaction.guildId!);
  if (!queue) {
    return interaction.reply({
      content: '❌ Nothing to skip.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  queue.skip();
  return interaction.reply({
    content: '⏭️ Skipped to the next track.',
  });
}