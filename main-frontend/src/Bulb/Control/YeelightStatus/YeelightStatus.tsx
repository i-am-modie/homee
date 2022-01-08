import { Card, Slider, Switch, Typography } from "antd";
import { FC, useEffect, useState } from "react";
import { Status } from "../../../components/atoms/Status";
import { YeelightStatusWrapper } from "./components/YeelightStatusWrapper";
import { YeelightStatusItem } from "./components/YeelightStatusItem";

export interface YeelightStatusProps {
  available?: boolean;
  name?: string;
  loading: boolean;
  power: boolean;
  brightness: number;
  onPowerChange: (checked: boolean) => void;
  onBrightnessChange: (value: number) => void;
}

export const YeelightStatus: FC<YeelightStatusProps> = ({
  available,
  loading,
  name,
  power,
  brightness,
  onPowerChange,
  onBrightnessChange,
}) => {
  const [brightnessState, setBrightnessState] = useState(brightness);
  useEffect(() => {
    setBrightnessState(brightness);
  }, [brightness]);

  return (
    <Card loading={loading}>
      <YeelightStatusWrapper>
        <YeelightStatusItem>
          <Typography.Text strong={true}>
            {name || undefined} Availability:
          </Typography.Text>
          <Status ok={!!available} />
        </YeelightStatusItem>
        <YeelightStatusItem>
          <Typography.Text strong={true}>Power:</Typography.Text>
          <Switch
            checked={power}
            onChange={onPowerChange}
            disabled={!available}
          />
        </YeelightStatusItem>
        <YeelightStatusItem style={{ flexBasis: 500, maxWidth: "initial" }}>
          <Typography.Text strong={true}>Brightness:</Typography.Text>
          <Slider
            style={{ width: "100%" }}
            value={brightnessState}
            onChange={setBrightnessState}
            onAfterChange={onBrightnessChange}
            disabled={!available}
          />
        </YeelightStatusItem>
      </YeelightStatusWrapper>
    </Card>
  );
};
