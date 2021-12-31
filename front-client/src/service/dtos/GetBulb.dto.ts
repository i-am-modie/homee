export interface GetBulbResponseBodyDto {
  id: string;
  status: boolean;
  power: boolean;
  name?: string;
  model: string;
  colorMode: number;
  available_actions: string[];
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
  bright: number;
  isShared: boolean,
  sharedWith: string[]
}
