import { FC, useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import debounce from "lodash.debounce";
import { useApiService } from "../../contexts/ApiServiceContext";
import { BulbWithStatus } from "../Bulb";
import { BulbReactContext } from "./contexts/BulbContext";
import { YeelightStatus } from "./YeelightStatus/YeelightStatus";

export const BulbControlWrapper: FC = () => {
  const { id: bulbId } = useParams();
  const navigate = useNavigate();
  const apiService = useApiService();

  const [bulb, setBulb] = useState<BulbWithStatus>();

  const refetchBulb = useCallback(async () => {
    if (!bulbId) {
      return;
    }
    const bulb = await apiService.getBulb(bulbId);
    setBulb(bulb);
  }, [bulbId, apiService]);

  useEffect(() => {
    refetchBulb();
    const pooling = setInterval(() => refetchBulb(), 2000);

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

      debounce(async (brightness: number) =>{
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
      <div style={{ height: "50px" }}>
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
      {bulb ? <Outlet /> : undefined}
    </BulbReactContext.Provider>
  );
};
