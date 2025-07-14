import { Client } from 'discord.js';

export function setupHealthMonitoring(client: Client) {
  setInterval(() => {
    console.log(`⚙️ Bot uptime: ${client.uptime}ms`);
  }, 60000);
}