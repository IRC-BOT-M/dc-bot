import { CommandInteraction, PermissionResolvable } from 'discord.js';

export function hasPermission(interaction: CommandInteraction, permission: PermissionResolvable): boolean {
  return interaction.memberPermissions?.has(permission) ?? false;
}