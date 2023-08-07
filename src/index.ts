import { common, webpack } from "replugged";
import {
  DiscordNotificationSetting,
  type Message,
  ShouldNotify,
  type ShouldNotifyCheck,
  UserGuildSettingsStore,
} from "./types";
import { cfg } from "./components/common";
const { getByStoreName, getByProps } = webpack;

export function start(): void {}

export function stop(): void {}

function phraseIncludes(phraseBank: string[], content: string): boolean {
  content = content.toLowerCase();

  for (const v of phraseBank) {
    if (content.includes(v.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function checkFactory(prefix: "good" | "bad"): Array<[string, ShouldNotifyCheck]> {
  const shouldNotifyV = prefix == "good" ? ShouldNotify.MUST_NOTIFY : ShouldNotify.DONT_NOTIFY;

  return [
    // phrase check
    [
      `${prefix}Phrase`,
      (msg) => {
        return phraseIncludes(cfg.get(`${prefix}Phrases`), msg.content)
          ? shouldNotifyV
          : ShouldNotify.CONTINUE;
      },
    ],
    // guild check
    [
      `${prefix}Guild`,
      (msg) => {
        if (!msg.guild_id) {
          return ShouldNotify.CONTINUE;
        }
        return cfg.get(`${prefix}Guilds`).split(" ").includes(msg.guild_id)
          ? shouldNotifyV
          : ShouldNotify.CONTINUE;
      },
    ],
    // user check
    [
      `${prefix}User`,
      (msg) =>
        cfg.get(`${prefix}Users`).split(" ").includes(msg.author.id)
          ? shouldNotifyV
          : ShouldNotify.CONTINUE,
    ],
    // channel check
    [
      `${prefix}ChannelCheck`,
      (msg) => {
        const channels = cfg.get(`${prefix}Channels`).split(" ");
        if (channels.includes(msg.channel_id)) {
          return shouldNotifyV;
        }
        // also check if the channel's category is muted
        if (msg.guild_id) {
          const chan = common.channels.getBasicChannel(msg.channel_id);
          if (!chan) {
            return ShouldNotify.CONTINUE;
          }
          if (chan.parent_id) {
            return channels.includes(chan.parent_id) ? shouldNotifyV : ShouldNotify.CONTINUE;
          }
        }
        return ShouldNotify.CONTINUE;
      },
    ],
  ];
}

/**
 * A list of checks, executed in order, to check if a notification should be played.
 *
 * Each check must return a ShouldNotify enum value:
 * 0 - Don't notify
 * 1 - Do Notify
 * 2 - Continue running the checks
 *
 * Each check is a [checkName, and a ShouldNotifyCheck]. Use ignoreChecks to blacklist some checks.
 *
 * If the notification checks reaches the end without a conclusive result (ie. all the checks return a CONTINUE (2)), then the user's status & channel/category/guild notification settings will be used as a fallback.
 */
export let notificationChecks: Array<[string, ShouldNotifyCheck]> = [
  [
    "selfException",
    (msg) =>
      msg.author.id == common.users.getCurrentUser().id
        ? ShouldNotify.DONT_NOTIFY
        : ShouldNotify.CONTINUE,
  ],
  [
    "focusedException",
    (msg) =>
      !cfg.get("notifyIfFocused") &&
      common.channels.getCurrentlySelectedChannelId() == msg.channel_id &&
      document.hasFocus()
        ? ShouldNotify.DONT_NOTIFY
        : ShouldNotify.CONTINUE,
  ],
  [
    "respectMutes",
    (msg) => {
      const store = getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore");

      // to make the editor happy <3
      if (!store) {
        return ShouldNotify.CONTINUE;
      }

      // self explanatory - check if the user already muted the guild, category, or channel
      if (msg.guild_id && cfg.get("respectMutedGuilds") && store.isMuted(msg.guild_id)) {
        return ShouldNotify.DONT_NOTIFY;
      }

      if (
        msg.guild_id &&
        cfg.get("respectMutedCategories") &&
        store.isCategoryMuted(msg.guild_id, msg.channel_id)
      ) {
        return ShouldNotify.DONT_NOTIFY;
      }
      if (cfg.get("respectMutedChannels")) {
        // have to use null for private channels, because shitcord
        let gID = null;
        if (msg.guild_id) {
          gID = msg.guild_id;
        }
        if (store.isChannelMuted(gID, msg.channel_id)) {
          return ShouldNotify.DONT_NOTIFY;
        }
      }

      return ShouldNotify.CONTINUE;
    },
  ],
  ...checkFactory("bad"),
  ...checkFactory("good"),
];

/**
 * A set of checks to not run (just in case others wanna use this)
 */
export let ignoreChecks = new Set<string>();

export function shouldNotify(e: { message: Message }): boolean {
  const msg = e.message;
  console.log(msg);

  for (const [name, f] of notificationChecks) {
    if (ignoreChecks.has(name)) {
      continue;
    }
    const out = f(msg);

    switch (out) {
      case ShouldNotify.DONT_NOTIFY:
        return false;
      case ShouldNotify.MUST_NOTIFY:
        return true;
    }
  }

  const status = getByProps<{ getStatus: () => string }, "getStatus" | "getActivities">([
    "getStatus",
    "getActivities",
  ])?.getStatus();

  // If the user is online or idle etc, then there is no need to do good checks - always fire the notification!
  if (status == "dnd") {
    return false;
  }

  if (!msg.guild_id) {
    return true;
  }

  // now, re-implement discord notification settings
  const store = getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore");

  if (!store) {
    return false;
  }

  let chanMsgNotifications = store.getChannelMessageNotifications(msg.guild_id, msg.channel_id);
  if (chanMsgNotifications == DiscordNotificationSetting.INHERIT) {
    const chan = common.channels.getBasicChannel(msg.channel_id);
    if (chan?.parent_id) {
      chanMsgNotifications = store.getChannelMessageNotifications(msg.guild_id, chan.parent_id);
    }
    if (chanMsgNotifications == DiscordNotificationSetting.INHERIT) {
      chanMsgNotifications = store.getMessageNotifications(msg.guild_id);
    }
  }

  if (chanMsgNotifications == DiscordNotificationSetting.NONE) {
    return false;
  } else if (chanMsgNotifications == DiscordNotificationSetting.ALL) {
    return true;
  }

  const member = common.users.getSelfMember(msg.guild_id);
  if (!member) {
    return false;
  }
  if (msg.mentions.includes(member.userId)) {
    return true;
  }

  if (
    !store.isSuppressRolesEnabled(msg.guild_id) &&
    member.roles.find((v) => msg.mention_roles.includes(v))
  ) {
    return true;
  }

  return false;
}

export { Settings } from "./components/settings";
