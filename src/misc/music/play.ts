import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
  MessageFlags
} from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { queues, MusicQueue } from '../../musicQueue.js';
import play from 'play-dl';

/**
 * Converts a YouTube URL into a proper watch URL.
 * – If the URL is in the shortened form (youtu.be), it extracts the video ID.
 * – If extra parameters (like playlist or index info) are present in a normal YouTube URL,
 *   it returns only the necessary "watch" URL with the v parameter.
 */
function convertYouTubeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace('/', '');
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    return url;
  } catch (error) {
    console.error("Error converting URL:", error);
    return url;
  }
}

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play music from a YouTube URL')
  .addStringOption(option =>
    option
      .setName('url')
      .setDescription('YouTube video link')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
  let url = interaction.options.getString('url', true);
  console.log("🔍 Raw URL from command:", url);

  url = convertYouTubeUrl(url);
  console.log("🧼 Sanitized URL:", url);

  const guildId = interaction.guildId!;
  const member = interaction.member as any;
  const voiceChannel = member.voice?.channel;
  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to play music.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  const isValid = await play.validate(url);
  if (!isValid) {
    return interaction.reply({
      content: '❌ That doesn’t look like a valid YouTube link.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  const info = await play.video_info(url);
  console.log("ℹ️ Video info:", info);
  
  const title = info.video_details.title ?? 'Unknown Title';
  const durationRaw = info.video_details.durationInSec;
  const duration = typeof durationRaw === 'string' ? parseInt(durationRaw) : durationRaw ?? 0;
  
  if (!info || !info.video_details) {
    return interaction.reply({
      content: '❌ Could not retrieve video info from YouTube.',
      flags: [MessageFlags.Ephemeral],
    });
  }

  let queue = queues.get(guildId);
  if (!queue) {
    queue = new MusicQueue();
    queues.set(guildId, queue);
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId,
    adapterCreator: interaction.guild!.voiceAdapterCreator,
  });
  queue.setConnection(connection);

  queue.add({
    url: url,
    title: title,
    duration: duration,
    requestedBy: interaction.user?.username ?? 'Unknown User'
  });

  console.log("🎼 Adding track to queue:", { url, title, duration, requestedBy: interaction.user?.username });
  return interaction.reply({
    content: `🎵 Queued: **${title}** (${duration}s)`,
  });
}