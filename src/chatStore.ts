import { common } from "replugged";
import { cfg, watchConf } from "./components/common";
import { DiscordNotificationSetting, Message, ShouldNotify, ShouldNotifyCheck } from "./types";
import { Status, getStatus, streamCheck, userGuildSettings } from "./common";

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
  streamCheck as [string, ShouldNotifyCheck],
  [
    "tmpListen",
    (msg) => {
      /** listener index, points */
      const listeners = watchConf
        .map((v, i) => {
          if (v.channel != msg.channel_id) {
            return false;
          }
          if (v.user && v.user != msg.author.id) {
            return false;
          }
          if (v.phrase && !msg.content.toLowerCase().includes(v.phrase.toLowerCase())) {
            return false;
          }

          let amt = 0;

          if (v.user) {
            amt++;
          }

          if (v.phrase) {
            amt += 2;
          }

          return [i, amt];
        })
        .filter((v) => v) as Array<[number, number]>;

      listeners.sort((a, b) => a[1] - b[1]);

      if (listeners.length == 0) {
        return ShouldNotify.CONTINUE;
      }

      const listenerID = listeners[0][0];

      const conf = watchConf[listenerID];
      conf.left--;

      if (conf.left <= 0) {
        watchConf.splice(listenerID, 1);
      } else {
        watchConf[listenerID] = conf;
      }

      return ShouldNotify.MUST_NOTIFY;
    },
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
      // self explanatory - check if the user already muted the guild, category, or channel
      if (
        msg.guild_id &&
        cfg.get("respectMutedGuilds") &&
        userGuildSettings.isMuted(msg.guild_id)
      ) {
        return ShouldNotify.DONT_NOTIFY;
      }

      if (
        msg.guild_id &&
        cfg.get("respectMutedCategories") &&
        userGuildSettings.isCategoryMuted(msg.guild_id, msg.channel_id)
      ) {
        return ShouldNotify.DONT_NOTIFY;
      }
      if (cfg.get("respectMutedChannels")) {
        // have to use null for private channels, because shitcord
        let gID = null;
        if (msg.guild_id) {
          gID = msg.guild_id;
        }
        if (userGuildSettings.isChannelMuted(gID, msg.channel_id)) {
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

function rawMsgNotifLogic(msg: Message): boolean {
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

  // If the user is online or idle etc, then there is no need to do good checks - always fire the notification!
  if (getStatus() == Status.DND) {
    return false;
  }

  if (!msg.guild_id) {
    return true;
  }

  let chanMsgNotifications = userGuildSettings.getChannelMessageNotifications(
    msg.guild_id,
    msg.channel_id,
  );
  if (chanMsgNotifications == DiscordNotificationSetting.INHERIT) {
    const chan = common.channels.getBasicChannel(msg.channel_id);
    if (chan?.parent_id) {
      chanMsgNotifications = userGuildSettings.getChannelMessageNotifications(
        msg.guild_id,
        chan.parent_id,
      );
    }
    if (chanMsgNotifications == DiscordNotificationSetting.INHERIT) {
      chanMsgNotifications = userGuildSettings.getMessageNotifications(msg.guild_id);
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
    !userGuildSettings.isSuppressRolesEnabled(msg.guild_id) &&
    member.roles.find((v) => msg.mention_roles.includes(v))
  ) {
    return true;
  }

  return false;
}

const notifCache = new Map<
  string,
  {
    createdAt: number;
    shouldNotify: boolean;
  }
>();

const CACHE_TTL = 10 * 1000 * 60;

/** Period job for cleaning out stale notification caches */
export function cleanMsgNotifCache(): void {
  notifCache.forEach((v, k) => {
    if (Date.now() - v.createdAt > CACHE_TTL) {
      notifCache.delete(k);
    }
  });
}

export function msgNotifLogic(msg: Message): boolean {
  if (notifCache.has(msg.id)) {
    return notifCache.get(msg.id)!.shouldNotify;
  }

  const shouldNotify = rawMsgNotifLogic(msg);

  if (cfg.get("pingOnNotif")) {
    // I think the mentioned module got yoinked... This is the next best thing <3
    msg.mentioned = true;
  }

  notifCache.set(msg.id, {
    createdAt: Date.now(),
    shouldNotify,
  });

  return shouldNotify;
}
