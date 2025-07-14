import { Interaction, Client, MessageFlags } from 'discord.js';
import { client } from '../bot.js';

interface Command {
  execute: (interaction: Interaction) => Promise<void>;
}

interface ClientWithCommands extends Client {
  commands: Map<string, Command>;
}

export async function handleInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const command = (client as ClientWithCommands).commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    if (!interaction.replied)
      await interaction.reply({ content: 'There was an error executing that command.', flags: [MessageFlags.Ephemeral] });
  }
}