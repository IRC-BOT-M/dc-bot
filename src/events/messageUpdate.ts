import { Client, Message } from 'discord.js';
import { logAction } from '../utils/database';

export function setupLogging(client: Client) {
  client.on('messageUpdate', async (oldMsg, newMsg) => {
    const oldMessage = oldMsg as Message;
    const newMessage = newMsg as Message;
    if (!oldMessage.author) return;
    if (oldMessage.content !== newMessage.content) {
      try {
        await logAction('Message Edited', oldMessage.author.id, `Old: ${oldMessage.content} | New: ${newMessage.content}`);
      } catch (err) {
        console.error('Error logging message edit:', err);
      }
      console.log(`📜 Message edited by ${oldMessage.author.tag}: \nOld: ${oldMessage.content}\nNew: ${newMessage.content}`);
    }
  });
}