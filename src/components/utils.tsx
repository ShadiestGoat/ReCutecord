import { common, components, util } from "replugged";
import { SettingsArray, SettingsString, cfg } from "./common";
const { useState } = common.React;
const { TextInput, Text, Button, ButtonItem, Flex, FormItem } = components;

export function Option({
  opt,
  title,
  explanation,
}: {
  opt: keyof SettingsString;
  title: string;
  explanation: string;
}): React.ReactElement {
  return (
    <div>
      <TitleSub title={title} explanation={explanation} />
      <TextInput
        placeholder={title}
        title={title}
        about={explanation}
        {...util.useSettingArray(cfg, opt, "")}
      />
    </div>
  );
}

export function TitleSub({
  title,
  explanation,
}: {
  title: string;
  explanation: string;
}): React.ReactElement {
  return (
    <>
      <Text variant="heading-xl/bold" selectable={true}>
        {title}
      </Text>
      <Text variant="text-md/normal" selectable={true}>
        {explanation}
      </Text>
    </>
  );
}

export function OptionPlus({
  opt,
  title,
  explanation,
}: {
  opt: keyof SettingsArray;
  title: string;
  explanation: string;
}): React.ReactElement {
  const { value, onChange } = util.useSetting(cfg, opt, []);
  const [editLoc, setEditLoc] = useState(-1);
  const [editCache, setEditCache] = useState("");

  const updateValue = (i: number) => {
    value[i] = editCache;
    setEditLoc(-1);
    setEditCache("");
    onChange([...value]);
  };

  const addValue = () => {
    value.push(editCache);
    setEditLoc(-1);
    setEditCache("");
    onChange([...value]);
  };

  return (
    <div>
      <TitleSub title={title} explanation={explanation} />
      <Flex className="option-plus-wrapper" direction={Flex.Direction.VERTICAL}>
        {value.map((v, i) => {
          return (
            <Flex direction={Flex.Direction.HORIZONTAL} style={{ gap: "2vw" }}>
              <FormItem>
                <TextInput
                  onSubmit={() => {
                    updateValue(i);
                  }}
                  onChange={setEditCache}
                  placeholder="Phrase"
                  value={i === editLoc ? editCache : v}
                  disabled={i !== editLoc}
                />
              </FormItem>
              {editLoc === i ? (
                <>
                  <ButtonItem
                    onClick={() => {
                      updateValue(i);
                    }}
                    button="💾"
                    color={Button.Colors.GREEN}
                    disabled={editCache.length === 0}
                  />
                  <ButtonItem
                    onClick={() => {
                      setEditLoc(-1);
                      setEditCache("");
                    }}
                    button="x"
                    color={Button.Colors.YELLOW}
                  />
                  <ButtonItem
                    onClick={() => {
                      value.splice(i, 1);
                      onChange([...value]);
                    }}
                    button="🗑️"
                    color={Button.Colors.RED}
                  />
                </>
              ) : (
                <>
                  <ButtonItem
                    onClick={() => {
                      setEditLoc(i);
                      setEditCache(v);
                    }}
                    button="Edit"
                    color={Button.Colors.BRAND}
                  />
                </>
              )}
            </Flex>
          );
        })}
        {editLoc === -2 ? (
          <Flex direction={Flex.Direction.HORIZONTAL} style={{ gap: "2vw" }}>
            <FormItem>
              <TextInput
                onSubmit={addValue}
                onChange={setEditCache}
                placeholder="Phrase"
                value={editCache}
              />
            </FormItem>
            <ButtonItem
              onClick={addValue}
              button="💾"
              color={Button.Colors.GREEN}
              disabled={editCache.length === 0}
            />
            <ButtonItem
              onClick={() => {
                setEditLoc(-1);
                setEditCache("");
              }}
              button="x"
              color={Button.Colors.RED}
            />
          </Flex>
        ) : (
          ""
        )}
        <Button
          onClick={() => {
            setEditLoc(-2);
            setEditCache("");
          }}>
          +
        </Button>
      </Flex>
    </div>
  );
}

export function Summary({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement[];
}): React.ReactElement {
  return (
    <>
      <details>
        <summary>
          <Text variant="heading-xxl/bold" selectable={true}>
            {title}
          </Text>
        </summary>
        {children}
      </details>
    </>
  );
}
