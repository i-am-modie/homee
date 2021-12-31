import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import debounce from "lodash.debounce";
import { useApiService } from "../../contexts/ApiServiceContext";
import { BulbWithStatus } from "../Bulb";
import { BulbReactContext } from "./contexts/BulbContext";
import { YeelightStatus } from "./YeelightStatus/YeelightStatus";
import { Card } from "antd";
import { ColorPicker } from "./ColorPicker/ColorPicker";
import { CTPicker } from "./CTPicker/CTPicker";

export const BulbControlWrapper: FC = () => {
  const { id: bulbId } = useParams();
  const navigate = useNavigate();
  const apiService = useApiService();

  const [bulb, setBulb] = useState<BulbWithStatus>();
  const [prevFetchedBulbId, setPrevFetchedBulbId] = useState<string>();
  const [activeTabKey1, setActiveTabKey1] = useState("tab1");

  const contentList = {
    tab1: <ColorPicker />,
    tab2: <CTPicker />,
  };

  const onTab1Change = (key: string) => {
    setActiveTabKey1(key);
  };

  const refetchBulb = useCallback(async () => {
    if (!bulbId) {
      return;
    }
    const fetchedBulb = await apiService.getBulb(bulbId);
    if (!prevFetchedBulbId || prevFetchedBulbId !== bulbId) {
      setActiveTabKey1(
        fetchedBulb.colorMode === 1 || fetchedBulb.colorMode === 3
          ? "tab1"
          : "tab2"
      );
    }
    setBulb(fetchedBulb);
    setPrevFetchedBulbId(fetchedBulb.id);
  }, [bulbId, apiService, prevFetchedBulbId]);

  useEffect(() => {
    refetchBulb();
    const pooling = setInterval(() => refetchBulb(), 5000);

    return () => clearInterval(pooling);
  }, [bulbId, refetchBulb]);

  const handlePowerChange = useCallback(
    async (power: boolean) => {
      if (!bulbId || !bulb) {
        return;
      }

      setBulb((bulb) => ({
        ...bulb!,
        power,
      }));
      await apiService.setBulbPower(bulbId, power);
    },
    [bulbId, apiService, bulb, setBulb]
  );

  const handleBrightChange = useCallback(
    debounce(async (brightness: number) => {
      if (!bulbId || !bulb) {
        return;
      }

      setBulb((bulb) => ({
        ...bulb!,
        bright: brightness,
      }));
      await apiService.setBulbBrightness(bulbId, brightness);
    }, 200),
    [bulbId, apiService, bulb, setBulb]
  );

  if (!bulbId) {
    navigate(-1);
    return null;
  }

  return (
    <BulbReactContext.Provider
      value={{
        bulb,
        refetchBulb,
        setBulb,
      }}
    >
      <div style={{ height: "100px" }}>
        <YeelightStatus
          loading={!bulb}
          available={!!(bulb && bulb.status)}
          name={bulb?.name || bulb?.id}
          power={bulb?.power ?? false}
          brightness={bulb?.bright ?? 0}
          onPowerChange={handlePowerChange}
          onBrightnessChange={handleBrightChange}
        />
      </div>
      <Card
        style={{ width: "100%" }}
        tabList={[
          {
            key: "tab1",
            tab: "Color",
          },
          {
            key: "tab2",
            tab: "Color temperature",
          },
        ]}
        activeTabKey={activeTabKey1}
        onTabChange={(key) => {
          onTab1Change(key);
        }}
      >
        {(contentList as any)[activeTabKey1]}
      </Card>
    </BulbReactContext.Provider>
  );
};
