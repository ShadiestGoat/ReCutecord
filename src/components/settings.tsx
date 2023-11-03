import { components, util } from "replugged";
import { Option, OptionPlus, Summary } from "./utils";
import "./settings.css";
import { cfg, defaultSettings, watchConf } from "./common";
const { Flex, SwitchItem, Notice, ButtonItem, Button, Text } = components;

export function Settings(): React.ReactElement {
  return (
    <Flex style={{ gap: "2vh", flexDirection: "column" }}>
      <Notice messageType={Notice.Types.INFO}>
        All text values (except phrases) are space separated lists!
      </Notice>

      <SwitchItem
        {...util.useSetting(cfg, "respectMutedChannelCalls", defaultSettings.respectMutedChannels)}
        note="Consider muted channels (groups & DMs) as bad channels for calls">
        Respect Muted Call Channels
      </SwitchItem>
      <SwitchItem
        {...util.useSetting(cfg, "respectMutedChannels", defaultSettings.respectMutedChannels)}
        note="Consider muted channels as part of the bad channels">
        Respect Muted Channels
      </SwitchItem>
      <SwitchItem
        {...util.useSetting(cfg, "respectMutedCategories", defaultSettings.respectMutedCategories)}
        note="Consider muted categories as part of the bad channels">
        Respect Muted Categories
      </SwitchItem>
      <SwitchItem
        {...util.useSetting(cfg, "respectMutedGuilds", defaultSettings.respectMutedGuilds)}
        note="Consider muted guilds as part of the bad guilds">
        Respect Muted Guilds
      </SwitchItem>
      <SwitchItem
        {...util.useSetting(cfg, "notifyIfFocused", defaultSettings.notifyIfFocused)}
        note="If enabled, this would send a notification even if you are viewing the current channel">
        Notify If Focused
      </SwitchItem>

      <Summary title="Cuties/Meanies">
        <Option
          opt="goodUsers"
          explanation="User IDs that you will be notified for (unless negative filters are met)"
          title="Cuties"
        />
        <Option
          opt="badUsers"
          explanation="User IDs that you will not be notified for"
          title="Meanies"
        />
      </Summary>

      <Summary title="Channels">
        <Option
          opt="goodChannels"
          explanation="Channel IDs that will send you notifications (unless negative filters are met)"
          title="Good Channels"
        />
        <Option
          opt="badChannels"
          explanation="Channel IDs that you will not be notified for"
          title="Bad Channels"
        />
      </Summary>

      <Summary title="Guilds">
        <Option
          opt="goodGuilds"
          explanation="Guild IDs that you will be notified for (unless negative filters are met)"
          title="Good Guilds"
        />
        <Option
          opt="badGuilds"
          explanation="Guild IDs that you will not be notified for"
          title="Bad Guilds"
        />
      </Summary>

      <Summary title="Phrases">
        <OptionPlus
          opt="goodPhrases"
          explanation="Case-insensitive phrases that you will be notified for (unless negative filters are met)"
          title="Good Phrases"
        />
        <OptionPlus
          opt="badPhrases"
          explanation="Case-insensitive phrases that you will be not notified for"
          title="Bad Phrases"
        />
      </Summary>
      <ButtonItem
        color={Button.Colors.RED}
        note={`Currently Active: ${watchConf.length}`}
        hideBorder
        button="Remove"
        onClick={() => console.log("Pressed!")}>
        <Text variant="text-lg/normal" selectable>
          Remove All Temporary Listeners
        </Text>
      </ButtonItem>
    </Flex>
  );
}
