import { createContext, useContext } from "react";
import { Bulb } from "../Bulb/Bulb";
export interface BulbsContext {
  bulbs: Bulb[];
  setBulbs: (bulbs: Bulb[]) => void;
  refetchBulbs: () => void;
}

export const BulbsReactContext = createContext<BulbsContext>({
  bulbs: [],
  refetchBulbs: () => {},
  setBulbs: () => {},
});

export const useBulbsContext = () => useContext(BulbsReactContext);
