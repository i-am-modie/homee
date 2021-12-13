import { createContext, useContext } from "react";
import { BulbWithStatus } from "../../Bulb";

export interface BulbContext {
  bulb: BulbWithStatus | undefined;
  setBulb: (bulbs: BulbWithStatus) => void;
  refetchBulb: () => void;
}

export const BulbReactContext = createContext<BulbContext>({
  bulb: undefined,
  refetchBulb: () => {},
  setBulb: () => {},
});

export const useBulbContext = () => useContext(BulbReactContext);
