import { settings } from "replugged";

export interface Settings extends SettingsString, SettingsArray {
  respectMutedChannels: boolean;
  respectMutedCategories: boolean;
  respectMutedGuilds: boolean;
  notifyIfFocused: boolean;
}

export interface SettingsString {
  cuties?: string;
  meanies?: string;
  channels?: string;
  badChannels?: string;
  guilds?: string;
  badGuilds?: string;
}

export interface SettingsArray {
  phrases?: string[];
  badPhrases?: string[];
}

export const defaultSettings = {
  cuties: "",
  meanies: "",
  phrases: [],
  badPhrases: [],
  channels: "",
  badChannels: "",
  guilds: "",
  badGuilds: "",
  respectMutedChannels: true,
  respectMutedCategories: true,
  respectMutedGuilds: true,
  notifyIfFocused: false,
} satisfies Settings;

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>(
  "eu.shadygoat.cutecord",
  defaultSettings,
);
