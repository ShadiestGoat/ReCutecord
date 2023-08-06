import { Injector, Logger, common, webpack } from "replugged";
import type { GuildStore, Message } from "./types";
import { cfg } from "./components/common";
const { getByStoreName, getByProps } = webpack;

const injector = new Injector();
const logger = Logger.plugin("Cutecord");

export function start(): void {
  logger.log("Started!! <3");
}

export function stop(): void {
  injector.uninjectAll();
}

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
  if (msg.author.id == common.users.getCurrentUser().id) {
    return true;
  }

  if (
    !cfg.get("notifyIfFocused") &&
    common.channels.getCurrentlySelectedChannelId() == msg.channel_id &&
    document.hasFocus()
  ) {
    return true;
  }

  const tmpStore = getByStoreName("UserGuildSettingsStore");
  // to make the editor happy <3
  if (!tmpStore) {
    return true;
  }

  const store = tmpStore as unknown as GuildStore;

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
    let gID = null;
    if (msg.guild_id) {
      gID = msg.guild_id;
    }
    if (store.isChannelMuted(gID, msg.channel_id)) {
      return true;
    }
  }

  for (const f of isBadChecks) {
    if (f(msg)) {
      return true;
    }
  }

  const status = getByProps<{ getStatus: () => string }, "getStatus" | "getActivities">([
    "getStatus",
    "getActivities",
  ])?.getStatus();

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
