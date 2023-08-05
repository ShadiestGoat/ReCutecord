import { settings, } from "replugged";

export interface Settings extends SettingsString, SettingsArray {
  
}

export interface SettingsString {
  cuties?: string,
  meanies?: string,
  channels?: string,
  badChannels?: string,
  guilds?: string,
  badGuilds?: string,
}

export interface SettingsArray {
  phrases?: string[],
  badPhrases?: string[],
}

const defaultSettings = {
  cuties:      "",
  meanies:     "",
  phrases:     [],
  badPhrases:  [],
  channels:    "",
  badChannels: "",
  guilds:      "",
  badGuilds:   "",
} satisfies Settings;

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>("eu.shadygoat.Cutecord", defaultSettings);
