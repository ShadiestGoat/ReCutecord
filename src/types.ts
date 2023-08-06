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
  // TODO: embed type
  embeds: [];
  mention_everyone: boolean;
  // TODO: mention_roles type
  mention_roles: [];
  guild_id?: string;
  // TODO: type
  mentions: [];
}

export type RefMessage = MessageBase & {
  author: RefMsgAuthor;
};

export type Message = MessageBase & {
  author: MsgAuthor;
  referenced_message?: RefMessage;
};
