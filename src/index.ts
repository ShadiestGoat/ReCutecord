import { Logger, common, webpack } from "replugged";
import type { Message } from "./types";
import { cfg } from "./components/common";
const { getByStoreName, getByProps } = webpack;
import { Store } from "replugged/dist/renderer/modules/common/flux";

const logger = Logger.plugin("Cutecord");

export function start(): void {
  logger.log("Started!! <3");
}

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

function checkFactory(prefix: "good" | "bad"): Array<(msg: Message) => boolean> {
  return [
    // phrase check
    (msg) => {
      return phraseIncludes(cfg.get(`${prefix}Phrases`), msg.content);
    },
    // guild check
    (msg) => {
      if (!msg.guild_id) {
        return false;
      }
      return cfg.get(`${prefix}Guilds`).split(" ").includes(msg.guild_id);
    },
    // user check
    (msg) => cfg.get(`${prefix}Users`).split(" ").includes(msg.author.id),
    // channel check
    (msg) => {
      const channels = cfg.get(`${prefix}Channels`).split(" ");
      if (channels.includes(msg.channel_id)) {
        return true;
      }
      // also check if the channel's category is muted
      if (msg.guild_id) {
        const chan = common.channels.getBasicChannel(msg.channel_id);
        if (!chan) {
          return false;
        }
        if (chan.parent_id) {
          return channels.includes(chan.parent_id);
        }
      }
      return false;
    },
  ];
}

const isBadChecks = checkFactory("bad");
const isGoodChecks = checkFactory("good");

export function shouldNotNotify(e: { message: Message }): boolean {
  const msg = e.message;

  // don't notify if its your own message
  if (msg.author.id == common.users.getCurrentUser().id) {
    return true;
  }

  // exception for if you already viewing a channel (& discord has focus)
  if (
    !cfg.get("notifyIfFocused") &&
    common.channels.getCurrentlySelectedChannelId() == msg.channel_id &&
    document.hasFocus()
  ) {
    return true;
  }

  const store = getByStoreName<
    Store & {
      isMuted(guildID: string): boolean;
      isChannelMuted(guildID: string | null, chanID: string): boolean;
      isCategoryMuted(guildID: string, chanID: string): boolean;
    }
  >("UserGuildSettingsStore");

  // to make the editor happy <3
  if (!store) {
    return true;
  }

  // self explanatory - check if the user already muted the guild, category, or channel
  if (msg.guild_id && cfg.get("respectMutedGuilds") && store.isMuted(msg.guild_id)) {
    return true;
  }
  if (
    msg.guild_id &&
    cfg.get("respectMutedCategories") &&
    store.isCategoryMuted(msg.guild_id, msg.channel_id)
  ) {
    return true;
  }
  if (cfg.get("respectMutedChannels")) {
    // have to use null for private channels, because shitcord
    let gID = null;
    if (msg.guild_id) {
      gID = msg.guild_id;
    }
    if (store.isChannelMuted(gID, msg.channel_id)) {
      return true;
    }
  }

  // Check if the message meets the bad checks. These filters take priority over all good filters because they act as what is essentially a safety net
  for (const f of isBadChecks) {
    if (f(msg)) {
      return true;
    }
  }

  const status = getByProps<{ getStatus: () => string }, "getStatus" | "getActivities">([
    "getStatus",
    "getActivities",
  ])?.getStatus();

  // If the user is online or idle etc, then there is no need to do good checks - always fire the notification!
  if (status != "dnd") {
    return false;
  }

  for (const f of isGoodChecks) {
    if (f(msg)) {
      return false;
    }
  }

  return true;
}

export { Settings } from "./components/settings";
