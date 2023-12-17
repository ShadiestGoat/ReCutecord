import { Injector, Logger, types, webpack } from "replugged";
import { type Message, MsgAuthor } from "./types";
import { cfg, watchConf } from "./components/common";
import { MenuGroupUtil, MenuItemChannel, MenuItemUser } from "./ctxMenu";
import { msgNotifLogic } from "./chatStore";

const { ContextMenuTypes, ApplicationCommandOptionType } = types;
const { getByProps } = webpack;

const inject = new Injector();
const logger = Logger.plugin("Cutecord");

export function start(): void {
  inject.utils.addMenuItem<{ user: MsgAuthor }>(
    ContextMenuTypes.UserContext,
    ({ user: { id } }) => {
      // eslint-disable-next-line new-cap
      return MenuGroupUtil({
        id,
        itemFactory: MenuItemUser,
        key: "Users",
      });
    },
  );

  inject.utils.addMenuItem<{ channel: { id: string } }>(
    ContextMenuTypes.ChannelContext,
    ({ channel: { id } }) => {
      // eslint-disable-next-line new-cap
      return MenuGroupUtil({
        id,
        itemFactory: MenuItemChannel,
        key: "Channels",
      });
    },
  );

  const mentionedMod = getByProps<{
    isRawMessageMentioned: (e: { rawMessage: Message }) => boolean;
    isMentioned: () => boolean;
    default: (e: { message: Message }) => boolean;
  }>("isRawMessageMentioned");

  if (mentionedMod) {
    inject.after(mentionedMod, "isRawMessageMentioned", (props, res) => {
      if (!cfg.get("pingOnNotif")) {
        return res;
      }
      return msgNotifLogic(props[0].rawMessage) || res;
    });
    inject.instead(mentionedMod, "default", (props, og) => {
      if (!cfg.get("pingOnNotif")) {
        return og(...props);
      }
      return msgNotifLogic(props[0].message) || og(...props);
    });
  } else {
    logger.error("Mention mod not found");
  }

  inject.utils.registerSlashCommand({
    name: "listen",
    description: "Add a temporary DND ignorer",
    options: [
      {
        name: "user",
        description: "Only listen to messages from this user",
        type: ApplicationCommandOptionType.User,
      },
      {
        name: "phrase",
        description: "Only listen to messages including this phrase (case insensitive)",
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "amount",
        description: "The amount of messages to keep this filter for (default = 1)",
        type: ApplicationCommandOptionType.Number,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        min_value: 1,
      },
      {
        name: "channel",
        description: "Listen to messages in another channel",
        type: ApplicationCommandOptionType.Channel,
      },
    ],
    executor(i) {
      const user = i.getValue("user"),
        phrase = i.getValue("phrase"),
        left = i.getValue("amount", 1),
        channel = i.getValue("channel", i.channel.id);

      watchConf.push({
        channel,
        left,
        user,
        phrase,
      });

      return {
        send: false,
        result: `Listening for messages in <#${channel}>${user ? ` by <@${user}>` : ""}${
          phrase ? ` including the phrase "${phrase}"` : ""
        }${left != 1 ? ` (${left} messages)` : ""}`,
      };
    },
  });
}

export function stop(): void {
  inject.uninjectAll();
}

export function shouldNotify(e: { message: Message }): boolean {
  return msgNotifLogic(e.message);
}

export { ignoreChecks, notificationChecks } from "./chatStore";

export { Settings } from "./components/settings";
export { call } from "./callStore";
