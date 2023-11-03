import { webpack } from "replugged"
import { CallStore, UserGuildSettingsStore } from "./types"

const { getByStoreName, getByProps } = webpack

export const userGuildSettings = getByStoreName<UserGuildSettingsStore>("UserGuildSettingsStore") as UserGuildSettingsStore
export const statusMod = getByProps([
  "getStatus",
  "getActivities",
]) as { getStatus: () => string }
export const callStore = getByStoreName<CallStore>("CallStore") as CallStore
