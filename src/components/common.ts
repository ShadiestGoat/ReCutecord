import { settings } from "replugged";

export type SettingsArrayKeys = "Phrases";
export type SettingsStringKeys = "Users" | "Channels" | "Guilds";
export type SettingsBools =
  | "respectMutedChannelCalls"
  | "respectMutedChannels"
  | "respectMutedCategories"
  | "respectMutedGuilds"
  | "notifyIfFocused"
  | "pingOnNotif";
export type SettingUtil<T extends string> = `good${T}` | `bad${T}`;
export type SettingsString = Record<SettingUtil<SettingsStringKeys>, string>;
export type SettingsArray = Record<SettingUtil<SettingsArrayKeys>, string[]>;
export type Settings = Partial<SettingsString & SettingsArray & Record<SettingsBools, boolean>>;

export const defaultSettings = {
  badChannels: "",
  goodChannels: "",
  badGuilds: "",
  goodGuilds: "",
  badUsers: "",
  goodUsers: "",
  badPhrases: [],
  goodPhrases: [],
  notifyIfFocused: false,
  respectMutedCategories: true,
  respectMutedChannels: true,
  respectMutedGuilds: true,
  respectMutedChannelCalls: true,
  pingOnNotif: true,
} satisfies Settings;

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>(
  "eu.shadygoat.cutecord",
  defaultSettings,
);

export const watchConf: Array<{ channel: string; left: number; user?: string; phrase?: string }> =
  [];
