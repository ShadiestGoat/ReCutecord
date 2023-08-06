import { common } from "replugged"
const { Store } = common.flux
/* eslint-disable @typescript-eslint/naming-convention */

interface baseUser {
  username: string,
  id: string,
  avatar: string,
}

export type msgAuthor = baseUser & {
  publicFlags: string,
  globalName: string,
}

export type refMsgAuthor = baseUser & {
  global_name: string,
  public_flags: string,
}

interface messageBase {
  id: string,
  
  attachments: string[],
  channel_id: string,
  content: string,
  // TODO: embed type
  embeds: [],
  mention_everyone: boolean,
  // TODO: mention_roles type
  mention_roles: [],
  guild_id?: string,
  // TODO: type
  mentions: [],
}

export type refMessage = messageBase & {
  author: refMsgAuthor
}

export type message = messageBase & {
  author: msgAuthor,
  referenced_message?: refMessage,
}

export type guildStore = typeof Store & {
  isMuted(guildID: string): boolean,
  isChannelMuted(guildID: string | null, chanID: string): boolean,
  isCategoryMuted(guildID: string, chanID: string): boolean,
}
