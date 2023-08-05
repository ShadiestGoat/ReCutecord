import { components, util } from "replugged";
import { Option, OptionPlus, Summary } from "./utils";
import "./settings.css";
import { cfg, defaultSettings } from "./common";
const { Text, Flex, SwitchItem } = components

export function Settings(): React.ReactElement {

  return <Flex style={{gap: "2vh", flexDirection: "column"}}>
    <Text variant="text-sm/normal" selectable={true}>
      Note: all text values (except phrases section) are space separated lists!
    </Text>

    <SwitchItem {...util.useSetting(cfg, "respectMutedChannels", defaultSettings.respectMutedChannels)} note="Consider muted channels as part of the bad channels">
      Respect Muted Channels
    </SwitchItem>
    <SwitchItem {...util.useSetting(cfg, "respectMutedCategories", defaultSettings.respectMutedCategories)} note="Consider muted categories as part of the bad channels">
      Respect Muted Categories
    </SwitchItem>
    <SwitchItem {...util.useSetting(cfg, "respectMutedGuilds", defaultSettings.respectMutedGuilds)} note="Consider muted guilds as part of the bad guilds">
      Respect Muted Guilds
    </SwitchItem>
    <SwitchItem {...util.useSetting(cfg, "notifyIfFocused", defaultSettings.notifyIfFocused)} note="If enabled, this would send a notification even if you are viewing the current channel">
      Notify If Focused
    </SwitchItem>
    
    <Summary title="Cuties/Meanies">
      <Option opt="cuties" explanation="User IDs that you will be notified for (unless negative filters are met)" title="Cuties" />
      <Option opt="meanies" explanation="User IDs that you will not be notified for" title="Meanies" />
    </Summary>

    <Summary title="Channels">
      <Option opt="channels" explanation="Channel IDs that will send you notifications (unless negative filters are met)" title="Good Channels" />
      <Option opt="badChannels" explanation="Channel IDs that you will not be notified for" title="Bad Channels" />
    </Summary>
    
    <Summary title="Guilds">
      <Option opt="guilds" explanation="Guild IDs that you will be notified for (unless negative filters are met)" title="Good Guilds" />
      <Option opt="badGuilds" explanation="Guild IDs that you will not be notified for" title="Bad Guilds" />
    </Summary>

    <Summary title="Phrases">
      <OptionPlus opt="phrases" explanation="Case-insensitive phrases that you will be notified for (unless negative filters are met)" title="Good Phrases" />
      <OptionPlus opt="badPhrases" explanation="Case-insensitive phrases that you will be not notified for" title="Bad Phrases" />
    </Summary>

 </Flex>
}
