import { TransitionEffect } from "./__types__/TransitionEffect.js";
import { TransitionModeEnum } from "./__types__/TransitionMode.enum.js";

export const DefaultTransitionEffect: TransitionEffect = {
  effect: TransitionModeEnum.SMOOTH,
  durationInMs: 500,
};
