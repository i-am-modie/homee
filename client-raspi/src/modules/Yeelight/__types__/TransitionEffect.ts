import { TransitionModeEnum } from "./TransitionMode.enum";

export interface TransitionEffect {
  effect: TransitionModeEnum;
  /** @min(30) */
  durationInMs: number;
}
