import { components } from "replugged";
import { SettingUtil, SettingsStringKeys, cfg } from "./components/common";

const {
  ContextMenu: { MenuItem, MenuGroup },
} = components;
import type React from "react";

function addValue(add: "good" | "bad", key: SettingsStringKeys, val: string): void {
  let rm: typeof add = add == "good" ? "bad" : "good";

  const rmKey = (rm + key) as SettingUtil<SettingsStringKeys>;
  const addKey = (add + key) as SettingUtil<SettingsStringKeys>;

  cfg.set(
    rmKey,
    cfg
      .get(rmKey)
      .split(" ")
      .filter((v) => v != val)
      .join(" "),
  );
  cfg.set(
    addKey,
    [
      ...cfg
        .get(addKey)
        .split(" ")
        .filter((v) => v != val),
      val,
    ].join(" "),
  );
}

function makeID(add: boolean, good: boolean, t: string): string {
  return `cutecord-${add ? "add" : "rm"}-${good ? "good" : "bad"}-${t}`;
}

export interface CustomMenuItemProps {
  id: string;
  add: boolean;
  good: boolean;
}

export const MenuItemUser = ({ id, add, good }: CustomMenuItemProps): React.ReactElement => {
  return (
    <MenuItem
      id={makeID(add, good, "user")}
      label={`Make${add ? "" : " not"} ${good ? "Cutie" : "Meanie"}`}
      action={() => {
        addValue(good ? "good" : "bad", "Users", id);
      }}
    />
  );
};

export const MenuItemChannel = ({ id, add, good }: CustomMenuItemProps): React.ReactElement => {
  return (
    <MenuItem
      id={makeID(add, good, "channel")}
      label={add ? `${!good ? "Don't " : ""}Receive Notifs` : "Default Notif Settings"}
      action={() => {
        addValue(good ? "good" : "bad", "Channels", id);
      }}
    />
  );
};

interface MenuGroupUtilProps {
  id: string;
  key: SettingsStringKeys;
  itemFactory: (v: CustomMenuItemProps) => React.ReactElement;
}

export const MenuGroupUtil = ({ id, key, itemFactory }: MenuGroupUtilProps): React.ReactElement => {
  const good = cfg.get(`good${key}`).includes(id);
  const bad = cfg.get(`bad${key}`).includes(id);

  return (
    <MenuGroup
      children={
        good == bad
          ? [
              itemFactory({ add: true, good: true, id }),
              itemFactory({ add: true, good: false, id }),
            ]
          : [itemFactory({ add: true, good: !good, id }), itemFactory({ add: false, good, id })]
      }
    />
  );
};
