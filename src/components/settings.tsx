import { components } from "replugged";
import { Option, OptionPlus, Summary } from "./utils";
import "./settings.css";
const { Text, Flex } = components

export function Settings(): React.ReactElement {

  return <Flex style={{gap: "2vh", flexDirection: "column"}}>
    <Text variant="text-sm/normal" selectable={true}>
      Note: all values are space separated lists!
    </Text>
    
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
