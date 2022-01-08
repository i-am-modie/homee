export interface Bulb {
  id: string;
  name?: string;
  model: string;
  colorMode: number;
  available_actions: string[];
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
  bright: number;
  sharedWith: string[];
  isShared: boolean;
}

export interface BulbWithStatus extends Bulb {
  status: boolean;
  power: boolean;
}
