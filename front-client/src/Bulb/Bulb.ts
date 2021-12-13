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
}

export interface BulbWithStatus extends Bulb {
  status: boolean;
  power: boolean;
}
