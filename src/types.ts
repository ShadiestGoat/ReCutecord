import { Store } from "replugged/dist/renderer/modules/common/flux";

/* eslint-disable @typescript-eslint/naming-convention */
interface BaseUser {
  username: string;
  id: string;
  avatar: string;
}

export type MsgAuthor = BaseUser & {
  publicFlags: string;
  globalName: string;
};

export type RefMsgAuthor = BaseUser & {
  global_name: string;
  public_flags: string;
};

interface MessageBase {
  id: string;

  attachments: string[];
  channel_id: string;
  content: string;
  embeds: [];
  mention_everyone: boolean;
  /**
   * List of role ids
   */
  mention_roles: string[];
  guild_id?: string;
  /**
   * List of user ids
   */
  mentions: string[];
}

export type RefMessage = MessageBase & {
  author: RefMsgAuthor;
};

export type Message = MessageBase & {
  author: MsgAuthor;
  referenced_message?: RefMessage;
};

export type ShouldNotifyCheck = (msg: Message) => ShouldNotify
export enum ShouldNotify {
  /**
   * If a check returns a DONT_NOTIFY, the check list will not continue, and the notification will not be played
   */
  DONT_NOTIFY,
  /**
   * If a check returns a MUST_NOTIFY, the check list will not continue, and the notification will be played
   */
  MUST_NOTIFY,
  /**
   * If a check returns a CONTINUE, the check list will continue
   */
  CONTINUE,
}

export enum DiscordNotificationSetting {
  ALL,
  ONLY_MENTIONS,
  NONE,
  INHERIT
}

export interface UserGuildSettingsStore extends Store {
  isMuted(guildID: string): boolean;
  isChannelMuted(guildID: string | null, chanID: string): boolean;
  isCategoryMuted(guildID: string, chanID: string): boolean;
  
  getMessageNotifications(guildID: string): DiscordNotificationSetting;
  getChannelMessageNotifications(guildID: string, chanID: string): DiscordNotificationSetting;
  
  isSuppressRolesEnabled(guildID: string): boolean;
  isSuppressEveryoneEnabled(guildID: string): boolean;
}
