import { common, components, util } from "replugged";
import { SettingsArray, SettingsString, cfg } from "./common";
const { useState } = common.React;
const { TextInput, Text, Button, Flex } = components;

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
    <Flex direction={Flex.Direction.VERTICAL}>
      <TitleSub title={title} explanation={explanation} />
      <TextInput
        className="option-text-inp"
        placeholder={title}
        title={title}
        about={explanation}
        {...util.useSetting(cfg, opt)}
      />
    </Flex>
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
  const { value, onChange } = util.useSetting(cfg, opt);
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
      <Flex
        className="option-plus-wrapper"
        direction={Flex.Direction.VERTICAL}
        style={{ gap: "2vh" }}>
        {value.map((v, i) => {
          return (
            <Flex direction={Flex.Direction.HORIZONTAL} style={{ gap: "2vw" }}>
              <TextInput
                onChange={setEditCache}
                placeholder="Phrase"
                value={i === editLoc ? editCache : v}
                disabled={i !== editLoc}
              />
              {editLoc === i ? (
                <OpenPlusEditItems
                  disableSave={editCache.length === 0}
                  onSave={() => {
                    updateValue(i);
                  }}
                  onDelete={() => {
                    value.splice(i, 1);
                    onChange([...value]);
                  }}
                  onCancel={() => {
                    setEditLoc(-1);
                    setEditCache("");
                  }}
                />
              ) : (
                <Button
                  onClick={() => {
                    setEditLoc(i);
                    setEditCache(v);
                  }}
                  color={Button.Colors.BRAND}>
                  Edit
                </Button>
              )}
            </Flex>
          );
        })}
        {editLoc === -2 ? (
          <Flex direction={Flex.Direction.HORIZONTAL} style={{ gap: "2vw" }}>
            <TextInput onChange={setEditCache} placeholder="Phrase" value={editCache} />
            <OpenPlusEditItems
              disableSave={editCache.length === 0}
              onSave={addValue}
              onDelete={() => {
                setEditLoc(-1);
                setEditCache("");
              }}
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

function OpenPlusEditItems({
  onSave,
  disableSave,
  onDelete,
  onCancel,
}: {
  onSave: () => void;
  disableSave: boolean;
  onDelete: () => void;
  onCancel?: () => void;
}): React.ReactElement {
  return (
    <>
      <Button onClick={onSave} color={Button.Colors.GREEN} disabled={disableSave}>
        💾
      </Button>
      {onCancel ? (
        <Button onClick={onCancel} color={Button.Colors.YELLOW}>
          X
        </Button>
      ) : (
        ""
      )}
      <Button onClick={onDelete} color={Button.Colors.RED}>
        🗑️
      </Button>
    </>
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
