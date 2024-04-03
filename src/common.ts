import { common, webpack } from "replugged";
import {
  CallStore,
  ShouldCallCheck,
  ShouldNotify,
  ShouldNotifyCheck,
  UserGuildSettingsStore,
} from "./types";
import { cfg } from "./components/common";

const { getByStoreName, getByProps } = webpack;

export const Status = common.constants.Status as Record<string, string> & {
  DND: string;
  STREAMING: string;
};

export const userGuildSettings = getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore")!;
const statusMod = getByProps<{ getStatus: (id: string) => string }, "getStatus" | "getActivities">([
  "getStatus",
  "getActivities",
])!;

export function getStatus(): keyof typeof Status {
  return statusMod.getStatus(common.users.getCurrentUser().id);
}

export const callStore = getByStoreName<CallStore>("CallStore")!;

export const streamCheck: [string, ShouldCallCheck | ShouldNotifyCheck] = [
  "streamNotif",
  (): ShouldNotify => {
    if (cfg.get("noNotifsWhenStreaming") && getStatus() == Status.STREAMING) {
      return ShouldNotify.DONT_NOTIFY;
    }

    return ShouldNotify.CONTINUE;
  },
];
