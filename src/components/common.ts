import { settings } from "replugged";

export type settingsArrayKeys = "Phrases";
export type settingsStringKeys = "Users" | "Channels" | "Guilds";
export type settingUtil<T extends string> = `good${T}` | `bad${T}`;
export type SettingsString = Record<settingUtil<settingsStringKeys>, string>;
export type SettingsArray = Record<settingUtil<settingsArrayKeys>, string[]>;
export type Settings = Partial<SettingsString &
  SettingsArray & {
    respectMutedChannels: boolean;
    respectMutedCategories: boolean;
    respectMutedGuilds: boolean;
    notifyIfFocused: boolean;
}>

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
} satisfies Settings;

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>(
  "eu.shadygoat.cutecord",
  defaultSettings,
);
