import { components } from "replugged";
import { SettingUtil, SettingsStringKeys, cfg } from "./components/common";

const { ContextMenu: { MenuItem, MenuGroup } } = components

function addValue(add: "good" | "bad", key: SettingsStringKeys, val: string) { 
  let rm: typeof add = add == "good" ? "bad" : "good"

  const rmKey = rm + key as SettingUtil<SettingsStringKeys>
  const addKey = add + key as SettingUtil<SettingsStringKeys>

  cfg.set(rmKey, cfg.get(rmKey).split(" ").filter(v => v != val).join(" "))
  cfg.set(addKey, [...cfg.get(addKey).split(" ").filter(v => v != val), val].join(" "))
}

export type MenuItemUserProps = {userID: string, add: boolean, good: boolean}

export const MenuItemUser = ({userID, add, good}: MenuItemUserProps) => {
  return <MenuItem 
    id={`cutecord-${add ? "add" : "rm"}-${good ? "cutie" : "meanie"}`}
    label={`Make${add ? "" : " not"} ${good ? "Cutie" : "Meanie"}`}
    action={() => {
      addValue(good ? "good" : "bad", "Users", userID)
    }}
  />
}
