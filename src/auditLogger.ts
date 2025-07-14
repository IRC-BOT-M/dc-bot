import { Guild, TextBasedChannel, AuditLogEvent } from "discord.js";

export async function logAuditEvent(
  guild: Guild,
  auditType: AuditLogEvent,
  eventName: string,
  additionalMessage = ""
) {
  try {
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: auditType,
    });
    const auditEntry = fetchedLogs.entries.first();
    if (!auditEntry) return;

    const logChannel = guild.channels.cache.get(process.env.LOG_CHANNEL_ID!);
    if (
      !logChannel ||
      !logChannel.isTextBased() ||
      typeof logChannel.send !== "function"
    )
      return;

    const executorTag = auditEntry.executor ? `${auditEntry.executor.tag} (${auditEntry.executor.id})` : "Unknown";
    const message = `**${eventName}**\nExecutor: ${executorTag}\nTarget: ${auditEntry.target}\nAction: ${auditEntry.action}${additionalMessage ? "\n" + additionalMessage : ""}`;

    await logChannel.send(message);
  } catch (error) {
    console.error(`Failed to log ${eventName}:`, error);
  }
}