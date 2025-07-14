import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  Interaction,
} from "discord.js";
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";
import initLogging from "./logging.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
}) as Client & { commands: Collection<string, any> };

client.commands = new Collection();

function loadCommands(dir: string) {
  for (const item of readdirSync(dir)) {
    const fullPath = join(dir, item);
    if (statSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (extname(item) === ".js") {
      import(fullPath)
        .then((cmd) => {
          if (cmd.data && cmd.execute) {
            client.commands.set(cmd.data.name, cmd);
          }
        })
        .catch((err) => console.error("Failed to load command:", err));
    }
  }
}

loadCommands(join(__dirname, "commands"));

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
  initLogging(client); 
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({
      content: `✨ I don’t have a command called \`/${interaction.commandName}\`... yet!`,
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`⚠️ Error running /${interaction.commandName}:`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Something went wrong while executing that command.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.BOT_TOKEN);