import { Injector, Logger, webpack, common } from "replugged";
import type { guildStore, message } from "./types";
import { Settings, cfg } from "./components/common";
const { getByStoreName } = webpack;


const injector = new Injector();
const logger = Logger.plugin("Cutecord");

export function start(): void  {
  logger.log("Started!! <3")
}

export function stop(): void {
  injector.uninjectAll();
}

function phraseIncludes(phraseBank: string[], content: string): boolean {
  content = content.toLowerCase()

  for (const v of phraseBank) {
    if (content.includes(v.toLowerCase())) {
      return true
    }
  }

  return false
}

function bsArrayInclude(v: string, conf?: string): boolean {
  return (conf?.split(" ") ?? []).includes(v)
}

const isBadChecks: Array<(msg: message, conf: Settings) => boolean> = [
  (msg, conf) => {
    // phrase check
    return phraseIncludes(conf.badPhrases ?? [], msg.content)
  },
  (msg, conf) => {
    if (!msg.guild_id) {
      return false
    }
    return bsArrayInclude(msg.guild_id, conf.badGuilds)
  },
  (msg, conf) => bsArrayInclude(msg.author.id, conf.meanies),
  (msg, conf) => {
    if (bsArrayInclude(msg.channel_id, conf.channels)) {
      return true
    }
    if (msg.guild_id) {
      const chan = common.channels.getBasicChannel(msg.channel_id)
      if (!chan) {
        return false
      }
      if (chan.parent_id) {
        return bsArrayInclude(chan.parent_id, conf.channels)
      }
    }

    return false
  }
]

const isGoodChecks: Array<(msg: message, conf: Settings) => boolean> = [
  (msg, conf) => {
    // phrase check
    return phraseIncludes(conf.phrases ?? [], msg.content)
  },
  (msg, conf) => {
    if (!msg.guild_id) {
      return false
    }
    return bsArrayInclude(msg.guild_id, conf.guilds)
  },
  (msg, conf) => bsArrayInclude(msg.author.id, conf.cuties),
  (msg, conf) => {
    if (bsArrayInclude(msg.channel_id, conf.channels)) {
      return true
    }
    if (msg.guild_id) {
      const chan = common.channels.getBasicChannel(msg.channel_id)
      if (!chan) {
        return false
      }
      if (chan.parent_id) {
        return bsArrayInclude(chan.parent_id, conf.channels)
      }
    }

    return false
  }
]

export function shouldNotNotify(e: {message: message}): boolean {
  const msg = e.message
  const tmpStore = getByStoreName("UserGuildSettingsStore")
  
  const conf = cfg.all()

  // to make the editor happy <3
  if (!tmpStore) {
    return true
  }

  const store = tmpStore as unknown as guildStore

  if (msg.guild_id && conf.respectMutedGuilds && store.isMuted(msg.guild_id)) {
    return true
  }
  if (msg.guild_id && conf.respectMutedCategories && store.isCategoryMuted(msg.guild_id, msg.channel_id)) {
    return true
  }
  if (conf.respectMutedChannels) {
    if (msg.guild_id) {
      if (store.isChannelMuted(msg.guild_id, msg.channel_id)) {
        return true
      }
    } else {
      // TODO: DM channels
    }
  }

  if (msg.guild_id && conf.respectMutedCategories && store.isCategoryMuted(msg.guild_id, msg.channel_id)) {
    return true
  }

  // notifyIfFocused
  // onlyActivateOnDND

  for (const f of isBadChecks) {
    if (f(msg, conf)) {
      return true
    }
  }

  for (const f of isGoodChecks) {
    if (f(msg, conf)) {
      return false
    }
  }

  return true
}

export { Settings } from "./components/settings"
