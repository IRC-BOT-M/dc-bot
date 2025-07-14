import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';

export type Track = {
  url: string;
  title: string;
  duration: number;
  requestedBy: string;
};

export class MusicQueue {
  private queue: Track[] = [];
  private player: AudioPlayer;
  private connection: VoiceConnection | null = null;
  private isPlaying = false;

  constructor() {
    this.player = createAudioPlayer();
    this.player.on(AudioPlayerStatus.Idle, () => this.playNext());
    this.player.on('error', (err) => {
      console.error('Audio player error:', err);
      this.playNext();
    });
  }

  setConnection(connection: VoiceConnection) {
    this.connection = connection;
    this.connection.subscribe(this.player);
  }

  add(track: Track) {
    this.queue.push(track);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  async playNext() {
    const next = this.queue.shift();
    if (!next) {
      this.isPlaying = false;
      return;
    }
    
    console.log("⏭️ Now playing:", next);

    try {
      const stream = ytdl(next.url, { filter: 'audioonly' });
      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      });

      this.player.play(resource);
      this.isPlaying = true;
      console.log(`🎶 Playing: ${next.title} (requested by ${next.requestedBy})`);
    } catch (err) {
      console.error("❌ Error playing track:", err);
      this.isPlaying = false;
      this.playNext();
    }
  }

  skip() {
    this.player.stop(true);
  }

  clear() {
    this.queue = [];
    this.player.stop(true);
    this.isPlaying = false;
  }

  getQueue(): Track[] {
    return this.queue;
  }

  pause(): boolean {
    return this.player.pause(true);
  }

  resume(): boolean {
    return this.player.unpause();
  }
}

export const queues: Map<string, MusicQueue> = new Map();