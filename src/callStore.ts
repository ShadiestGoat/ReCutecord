import { Channel } from "discord-types/general";
import { Logger, common, webpack } from "replugged";
import { ShouldCallCheck, ShouldNotify, UserGuildSettingsStore } from "./types";
import { cfg } from "./components/common";
import { callStore, statusMod } from "./common";

const { getByStoreName } = webpack;
const { channels, messages } = common

/**
 * A set of channel IDs
 */
type CallSet = Set<string>

function processChannel(chanInput: string | Channel): Channel {
  const aa = (typeof chanInput == "string" ? channels.getBasicChannel(chanInput) : chanInput) as Channel
  if (!aa) {
    console.log(aa, chanInput)
  }
  return aa
}

/**
 * Same as the notifyChecks, but for calls. The functions have 1 argument, which is the channel id.
 */
export let callChecks: Array<[string, ShouldCallCheck]> = [
  ["respectChannels", (chanInput) => {
    const chan = processChannel(chanInput)

    if (!cfg.get("respectMutedChannelCalls")) {
      return ShouldNotify.CONTINUE
    }

    const store = getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore");
    // to make the editor happy <3
    if (store?.isChannelMuted(null, chan.id)) {
      return ShouldNotify.DONT_NOTIFY;
    }

    return ShouldNotify.CONTINUE
  }],
  ...callCheckFactory("bad"),
  ...callCheckFactory("good"),
]

function callCheckFactory(prefix: "good" | "bad"): Array<[string, ShouldCallCheck]> {
  const shouldNotifyV = prefix == "good" ? ShouldNotify.MUST_NOTIFY : ShouldNotify.DONT_NOTIFY;

  return [
    [
      `${prefix}Channels`,
      (chanInp) => {
        const chanID = typeof chanInp == "string" ? chanInp : chanInp.id

        const channels = cfg.get(`${prefix}Channels`).split(" ");
        
        if (channels.includes(chanID)) {
          return shouldNotifyV;
        }

        return ShouldNotify.CONTINUE
      },
    ],
    [
      `${prefix}Users`,
      (chanInp) => {
        const chan = processChannel(chanInp)

        const users = cfg.get(`${prefix}Users`).split(" ");

        let userID: string | undefined;

        if (chan.recipients.length == 1) {
          userID = chan.recipients[0]
        } else {
          userID = messages.getMessage(chan.id, callStore.getMessageId(chan.id))?.author.id
        }

        if (userID && users.includes(userID)) {
          return shouldNotifyV;
        }

        return ShouldNotify.CONTINUE
      },
    ],
  ]
}

function shouldCall(chanInput: string | Channel, isDND: boolean): boolean {
  for (const c of callChecks) {
    const resp = c[1](chanInput)
    if (resp == ShouldNotify.CONTINUE) {
      continue
    }
    return resp == ShouldNotify.MUST_NOTIFY
  }

  return !isDND
}

// Thanks a lot, @Tharki-God and @lexisother
export const call = {
  getIncomingCalls(m: Map<string,{channel: Channel}>) {
    const isDND = statusMod.getStatus() == "dnd"

    return Array.from(m.values()).filter(v => {
      return shouldCall(v.channel, isDND)
    })
  },
  getIncomingCallChannelIds(s: CallSet) {
    const isDND = statusMod.getStatus() == "dnd"

    return new Set(Array.from(s).filter(v => {
      console.log("getIncomingCallChannelIds", v)
      return shouldCall(v, isDND)
    }))
  },
  getFirstIncomingCallId(s: CallSet) {
    const isDND = statusMod.getStatus() == "dnd"

    while (true) {
      const v = s.values().next()
      if (v.done) {
        return null
      }
      console.log("getFirstIncomingCallId", v.done)
      if (shouldCall(v.value, isDND)) {
        return v.value
      }
    }
  },
  hasIncomingCalls(s: CallSet) {
    const arr = Array.from(s)
    const isDND = statusMod.getStatus() == "dnd"

    for (const v of arr) {
      if (shouldCall(v, isDND)) {
        return true
      }
    }

    return false
  }
}
