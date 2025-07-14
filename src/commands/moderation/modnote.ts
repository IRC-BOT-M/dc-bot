import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getModNotes, addModNote } from '../../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('modnote')
  .setDescription('View or add moderator notes for a user.')
  .addUserOption(option => option.setName('target').setDescription('User to note').setRequired(true))
  .addStringOption(option => option.setName('note').setDescription('Note text (leave empty to view notes)'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.get("target")?.user;
  if (!targetUser) {
    return interaction.reply({ content: "Please specify a target user.", flags: [MessageFlags.Ephemeral] });
  }
  const note = interaction.options.get('note')?.value as string | undefined;
  if (note) {
    try {
      await addModNote(targetUser.id, note, interaction.user.tag);
      await interaction.reply({ content: `Added note for ${targetUser.tag}.`});
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Failed to add note.", flags: [MessageFlags.Ephemeral] });
    }
  } else {
    try {
      const notes = await getModNotes(targetUser.id);
      if (!notes || notes.length === 0)
        return interaction.reply({ content: "No moderator notes found.", flags: [MessageFlags.Ephemeral] });
      const noteList = notes.map(n => `- ${n.note} (by ${n.moderator})`).join('\n');
      await interaction.reply({ content: `Notes for ${targetUser.tag}:\n${noteList}`});
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Failed to retrieve notes.", flags: [MessageFlags.Ephemeral] });
    }
  }
}