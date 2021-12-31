export interface GetBulbsResponseBodyDto {
  bulbs: GetBulbsBulbsResponseBodyDto[];
}

export interface GetBulbsBulbsResponseBodyDto {
  id: string;
  name?: string;
  model: string;
  colorMode: number;
  available_actions: string[];
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
  isShared: boolean;
  sharedWith: string[];
}
