import { SlashCommandBuilder } from "@discordjs/builders"; 
import { CommandInteraction, MessageFlags } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check the bot’s latency");

export async function execute(interaction: CommandInteraction) {
  try {
    const start = Date.now();

    await interaction.reply({
      content: "🏓 Pinging…",
      withResponse: true,
      flags: [MessageFlags.Ephemeral],
    });

    const latency = Date.now() - start;
    console.log(`/ping command executed. Latency: ${latency}ms`);

    await interaction.editReply(`🏓 Pong! ${latency}ms.`);
  } catch (error) {
    console.error("Error in /ping command:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Oops, something went wrong!",
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}