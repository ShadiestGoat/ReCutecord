import { webpack } from "replugged";
import { CallStore, UserGuildSettingsStore } from "./types";

const { getByStoreName, getByProps } = webpack;

export const userGuildSettings = getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore")!;
export const statusMod = getByProps<{ getStatus: () => string }, "getStatus" | "getActivities">([
  "getStatus",
  "getActivities",
])!;
export const callStore = getByStoreName<CallStore>("CallStore")!;
