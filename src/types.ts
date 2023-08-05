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
