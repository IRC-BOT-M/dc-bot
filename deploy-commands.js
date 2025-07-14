import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const commands = [];
const commandsPath = path.join(process.cwd(), 'dist', 'commands');
const entries = fs.readdirSync(commandsPath);

for (const entry of entries) {
  const entryPath = path.join(commandsPath, entry);
  const stat = fs.lstatSync(entryPath);
  
  if (stat.isDirectory()) {
    const commandFiles = fs.readdirSync(entryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(entryPath, file);
      const commandModule = await import(filePath);
      if ('data' in commandModule && typeof commandModule.data.toJSON === 'function') {
        commands.push(commandModule.data.toJSON());
      } else {
        console.warn(`Skipping ${filePath}: missing data property.`);
      }
    }
  } else if (stat.isFile() && entry.endsWith('.js')) {
    const commandModule = await import(entryPath);
    if ('data' in commandModule && typeof commandModule.data.toJSON === 'function') {
      commands.push(commandModule.data.toJSON());
    } else {
      console.warn(`Skipping ${entryPath}: missing data property.`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const dedupedCommands = Array.from(
  new Map(commands.map(cmd => [cmd.name, cmd])).values()
);

console.log(`Deploying ${dedupedCommands.length} unique commands out of ${commands.length} found.`);

(async () => {
  const commands = [];
  const commandsPath = path.join(process.cwd(), 'dist', 'commands');

  const entries = fs.readdirSync(commandsPath);

  for (const entry of entries) {
    const entryPath = path.join(commandsPath, entry);
    const stats = fs.lstatSync(entryPath);

    if (stats.isDirectory()) {
      const commandFiles = fs.readdirSync(entryPath).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const filePath = path.join(entryPath, file);
        const commandModule = await import(filePath);
        if ('data' in commandModule && typeof commandModule.data.toJSON === 'function') {
          commands.push(commandModule.data.toJSON());
        } else {
          console.warn(`Skipping ${filePath}: missing data property.`);
        }
      }
    } else if (stats.isFile() && entry.endsWith('.js')) {
      const commandModule = await import(entryPath);
      if ('data' in commandModule && typeof commandModule.data.toJSON === 'function') {
        commands.push(commandModule.data.toJSON());
      } else {
        console.warn(`Skipping ${entryPath}: missing data property.`);
      }
    }
  }

  const dedupedCommands = Array.from(new Map(commands.map(cmd => [cmd.name, cmd])).values());
  console.log(`Deploying ${dedupedCommands.length} unique commands out of ${commands.length} found.`);

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  try {
    console.log(`Started refreshing ${dedupedCommands.length} application (/) commands.`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: dedupedCommands }
    );
    console.log('Successfully reloaded guild commands.');
  } catch (error) {
    console.error(error);
  }
})();
