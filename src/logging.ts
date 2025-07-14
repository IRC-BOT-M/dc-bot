import {
  Client,
  AuditLogEvent,
  EmbedBuilder,
  Guild,
  TextChannel,
  ChannelType,
} from "discord.js";

const auditMappings: {
  eventName: string;
  auditType?: AuditLogEvent;
  label: string;
}[] = [
  { eventName: "guildUpdate", auditType: AuditLogEvent.GuildUpdate, label: "Guild Updated" },
  { eventName: "channelCreate", auditType: AuditLogEvent.ChannelCreate, label: "Channel Created" },
  { eventName: "channelUpdate", auditType: AuditLogEvent.ChannelUpdate, label: "Channel Updated" },
  { eventName: "channelDelete", auditType: AuditLogEvent.ChannelDelete, label: "Channel Deleted" },
  { eventName: "overwriteCreate", auditType: AuditLogEvent.ChannelOverwriteCreate, label: "Channel Overwrite Created" },
  { eventName: "overwriteUpdate", auditType: AuditLogEvent.ChannelOverwriteUpdate, label: "Channel Overwrite Updated" },
  { eventName: "overwriteDelete", auditType: AuditLogEvent.ChannelOverwriteDelete, label: "Channel Overwrite Deleted" },
  { eventName: "guildMemberRemove", auditType: AuditLogEvent.MemberKick, label: "Member Kicked/Left" },
  { eventName: "guildBanAdd", auditType: AuditLogEvent.MemberBanAdd, label: "Member Banned" },
  { eventName: "guildBanRemove", auditType: AuditLogEvent.MemberBanRemove, label: "Member Unbanned" },
  { eventName: "guildMemberUpdate", auditType: AuditLogEvent.MemberUpdate, label: "Member Updated" },
  { eventName: "voiceStateUpdate", label: "Member Voice State Changed" },
  { eventName: "roleCreate", auditType: AuditLogEvent.RoleCreate, label: "Role Created" },
  { eventName: "roleUpdate", auditType: AuditLogEvent.RoleUpdate, label: "Role Updated" },
  { eventName: "roleDelete", auditType: AuditLogEvent.RoleDelete, label: "Role Deleted" },
  { eventName: "inviteCreate", auditType: AuditLogEvent.InviteCreate, label: "Invite Created" },
  { eventName: "inviteUpdate", auditType: AuditLogEvent.InviteUpdate, label: "Invite Updated" },
  { eventName: "inviteDelete", auditType: AuditLogEvent.InviteDelete, label: "Invite Deleted" },
  { eventName: "webhookUpdate", auditType: AuditLogEvent.WebhookUpdate, label: "Webhook Changed" },
  { eventName: "emojiCreate", auditType: AuditLogEvent.EmojiCreate, label: "Emoji Created" },
  { eventName: "emojiUpdate", auditType: AuditLogEvent.EmojiUpdate, label: "Emoji Updated" },
  { eventName: "emojiDelete", auditType: AuditLogEvent.EmojiDelete, label: "Emoji Deleted" },
  { eventName: "messageDeleteBulk", label: "Bulk Message Deleted" },
  { eventName: "messagePin", label: "Message Pinned" },
  { eventName: "messageUnpin", label: "Message Unpinned" },
  { eventName: "integrationCreate", auditType: AuditLogEvent.IntegrationCreate, label: "Integration Created" },
  { eventName: "integrationUpdate", auditType: AuditLogEvent.IntegrationUpdate, label: "Integration Updated" },
  { eventName: "integrationDelete", auditType: AuditLogEvent.IntegrationDelete, label: "Integration Deleted" },
  { eventName: "stageInstanceCreate", auditType: AuditLogEvent.StageInstanceCreate, label: "Stage Instance Created" },
  { eventName: "stageInstanceUpdate", auditType: AuditLogEvent.StageInstanceUpdate, label: "Stage Instance Updated" },
  { eventName: "stageInstanceDelete", auditType: AuditLogEvent.StageInstanceDelete, label: "Stage Instance Deleted" },
  { eventName: "stickerCreate", auditType: AuditLogEvent.StickerCreate, label: "Sticker Created" },
  { eventName: "stickerUpdate", auditType: AuditLogEvent.StickerUpdate, label: "Sticker Updated" },
  { eventName: "stickerDelete", auditType: AuditLogEvent.StickerDelete, label: "Sticker Deleted" },
  { eventName: "guildScheduledEventCreate", auditType: AuditLogEvent.GuildScheduledEventCreate, label: "Scheduled Event Created" },
  { eventName: "guildScheduledEventUpdate", auditType: AuditLogEvent.GuildScheduledEventUpdate, label: "Scheduled Event Updated" },
  { eventName: "guildScheduledEventDelete", auditType: AuditLogEvent.GuildScheduledEventDelete, label: "Scheduled Event Deleted" },
  { eventName: "threadCreate", auditType: AuditLogEvent.ThreadCreate, label: "Thread Created" },
  { eventName: "threadUpdate", auditType: AuditLogEvent.ThreadUpdate, label: "Thread Updated" },
  { eventName: "threadDelete", auditType: AuditLogEvent.ThreadDelete, label: "Thread Deleted" },
  { eventName: "applicationCommandPermissionsUpdate", auditType: AuditLogEvent.ApplicationCommandPermissionUpdate, label: "Application Command Permissions Updated" },
  { eventName: "soundboardSoundCreate", auditType: AuditLogEvent.SoundboardSoundCreate, label: "Soundboard Sound Created" },
  { eventName: "soundboardSoundUpdate", auditType: AuditLogEvent.SoundboardSoundUpdate, label: "Soundboard Sound Updated" },
  { eventName: "soundboardSoundDelete", auditType: AuditLogEvent.SoundboardSoundDelete, label: "Soundboard Sound Deleted" },
  { eventName: "autoModerationRuleCreate", auditType: AuditLogEvent.AutoModerationRuleCreate, label: "Auto Moderation Rule Created" },
  { eventName: "autoModerationRuleUpdate", auditType: AuditLogEvent.AutoModerationRuleUpdate, label: "Auto Moderation Rule Updated" },
  { eventName: "autoModerationRuleDelete", auditType: AuditLogEvent.AutoModerationRuleDelete, label: "Auto Moderation Rule Deleted" },
  { eventName: "autoModerationBlockMessage", auditType: AuditLogEvent.AutoModerationBlockMessage, label: "Auto Moderation Blocked Message" },
  { eventName: "autoModerationFlagToChannel", auditType: AuditLogEvent.AutoModerationFlagToChannel, label: "Auto Moderation Flagged to Channel" },
  { eventName: "autoModerationUserCommunicationDisabled", auditType: AuditLogEvent.AutoModerationUserCommunicationDisabled, label: "Auto Moderation User Communication Disabled" },
  { eventName: "creatorMonetizationRequestCreated", auditType: AuditLogEvent.CreatorMonetizationRequestCreated, label: "Creator Monetization Request Created" },
  { eventName: "creatorMonetizationTermsAccepted", auditType: AuditLogEvent.CreatorMonetizationTermsAccepted, label: "Creator Monetization Terms Accepted" },
  { eventName: "onboardingPromptCreate", auditType: AuditLogEvent.OnboardingPromptCreate, label: "Onboarding Prompt Created" },
  { eventName: "onboardingPromptUpdate", auditType: AuditLogEvent.OnboardingPromptUpdate, label: "Onboarding Prompt Updated" },
  { eventName: "onboardingPromptDelete", auditType: AuditLogEvent.OnboardingPromptDelete, label: "Onboarding Prompt Deleted" },
  { eventName: "onboardingCreate", auditType: AuditLogEvent.OnboardingCreate, label: "Onboarding Created" },
  { eventName: "onboardingUpdate", auditType: AuditLogEvent.OnboardingUpdate, label: "Onboarding Updated" },
  { eventName: "homeSettingsCreate", auditType: AuditLogEvent.HomeSettingsCreate, label: "Home Settings Created" },
  { eventName: "homeSettingsUpdate", auditType: AuditLogEvent.HomeSettingsUpdate, label: "Home Settings Updated" },
];

export default function initLogging(client: Client) {
  const logChannelId = process.env.LOG_CHANNEL_ID!;
  for (const { eventName, auditType, label } of auditMappings) {
    client.on(eventName as any, async (...args: any[]) => {
      const guild: Guild | undefined =
        args[0]?.guild ?? args[1]?.guild ?? (args[0] instanceof Guild ? args[0] : undefined);
      if (!guild) return;

      const ch = guild.channels.cache.get(logChannelId);
      if (!ch || ch.type !== ChannelType.GuildText) return;
      const logChannel = ch as TextChannel;

      let embed: EmbedBuilder;
      if (auditType) {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: auditType });
        const entry = logs.entries.first();
        if (entry) {
          embed = new EmbedBuilder()
            .setTitle(label)
            .setColor(0x00ae86)
            .setTimestamp(entry.createdAt)
            .setFooter({ text: "Audit Log" })
            .addFields(
              { name: "Executor", value: `<@${entry.executor?.id}>`, inline: true },
              { name: "Target", value: String(entry.target), inline: true },
              { name: "Action", value: String(entry.action), inline: true }
            );
          if (entry.extra) {
            embed.addFields({ name: "Details", value: String(entry.extra) });
          }
        } else {
          embed = new EmbedBuilder()
            .setTitle(`${label} — no audit log entry`)
            .setColor(0xff0000);
        }
      } else {
        embed = new EmbedBuilder()
          .setTitle(label)
          .setColor(0xffa500)
          .setTimestamp(new Date())
          .setDescription(JSON.stringify(args, null, 2));
      }

      await logChannel.send({ embeds: [embed] });
    });
  }
}