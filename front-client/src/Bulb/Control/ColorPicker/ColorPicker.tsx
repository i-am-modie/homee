import { FC, useCallback, useState } from "react";
import { SketchPicker, ColorResult } from "react-color";
import { useApiService } from "../../../contexts/ApiServiceContext";
import { useBulbContext } from "../contexts/BulbContext";
import {
  convertDecimalRGBToHex,
  convertHexRGBToDecimal,
} from "../helpers/yeelightRgb";

export const ColorPicker: FC = () => {
  const { bulb } = useBulbContext();
  const [color, setColor] = useState<string>(
    convertDecimalRGBToHex(bulb?.rgb!)
  );
  const apiService = useApiService();

  const handleRGBChange = useCallback(
    async (rgb: ColorResult) => {
      if (!bulb) {
        return;
      }
      setColor(rgb.hex);
      console.log("color picked", rgb.hex);
      const rgbDec = convertHexRGBToDecimal(rgb.hex);

      await apiService.setBulbRGB(bulb.id, Number(rgbDec), bulb.bright);
    },
    [apiService, bulb]
  );

  if (!bulb || !bulb.status) {
    return null;
  }

  return (
    <SketchPicker
      color={color}
      onChangeComplete={handleRGBChange}
      disableAlpha={true}
    />
  );
};
