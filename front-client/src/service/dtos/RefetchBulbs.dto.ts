export interface RefetchBulbsResponseBodyDto {
  bulbs: RefetchBulbsBulbsResponseBodyDto[];
}

export interface RefetchBulbsBulbsResponseBodyDto {
  id: string;
  name?: string;
  model: string;
  colorMode: number;
  available_actions: string[];
  rgb: string;
  hue: number;
  sat: number;
  ct: number;
}
