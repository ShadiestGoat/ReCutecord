import { Injector, Logger, types, webpack } from "replugged";
import { type Message, MsgAuthor } from "./types";
import { cfg, watchConf } from "./components/common";
import { MenuGroupUtil, MenuItemChannel, MenuItemUser } from "./ctxMenu";
import { cleanMsgNotifCache, msgNotifLogic } from "./chatStore";

const { ContextMenuTypes, ApplicationCommandOptionType } = types;
const { getFunctionKeyBySource, getBySource } = webpack

const inject = new Injector();
const logger = Logger.plugin("Cutecord");

// 5 mins
const FUNNY_BUSINESS_FREQUENCY = 5 * 1000 * 60;

let stopDoingFunnyBusiness = false;

function doFunnyBusiness(): void {
  if (stopDoingFunnyBusiness) {
    stopDoingFunnyBusiness = false;
    return;
  }

  cleanMsgNotifCache();

  setTimeout(doFunnyBusiness, FUNNY_BUSINESS_FREQUENCY);
}

function loadMentionMod(): void {
  const mod = getBySource<{
    isRawMessageMentioned: (e: { rawMessage: Message }) => boolean
    isMentioned: () => boolean;
    default: (e: { message: Message }) => boolean;
  }>(/\{userId:\w+,channelId:\w+,mentionEveryone:\w+,mentionUsers:\w+,mentionRoles:\w+,suppressEveryone:.+?,suppressRoles.+?\}/)

  if (!mod) {
    logger.error("Mention mod not found");
    return
  }

  const fRawIsMentioned = getFunctionKeyBySource(mod, "rawMessage") as "isRawMessageMentioned" | undefined
  const fDefault = getFunctionKeyBySource(mod, "message") as "default" | undefined

  if (!fDefault || !fRawIsMentioned) {
    logger.error(`Mention mod - failed to find the 2 funcs: default: '${fDefault}', raw: '${fRawIsMentioned}'`);
    return
  }

  inject.after(mod, fRawIsMentioned, (props, res) => {
    if (!cfg.get("pingOnNotif")) {
      return res;
    }
    return msgNotifLogic(props[0].rawMessage) || res;
  });
  inject.instead(mod, fDefault, (props, og) => {
    if (!cfg.get("pingOnNotif")) {
      return og(...props);
    }
    return msgNotifLogic(props[0].message) || og(...props);
  });
}

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

  loadMentionMod()

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

  if (stopDoingFunnyBusiness) {
    stopDoingFunnyBusiness = false;
  } else {
    setTimeout(doFunnyBusiness, FUNNY_BUSINESS_FREQUENCY);
  }
}

export function stop(): void {
  inject.uninjectAll();
  stopDoingFunnyBusiness = true;
}

export function shouldNotify(e: { message: Message }): boolean {
  return msgNotifLogic(e.message);
}

export { ignoreChecks, notificationChecks } from "./chatStore";

export { Settings } from "./components/settings";
export { call } from "./callStore";
