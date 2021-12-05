import { Bulb } from "../models/Bulb";

export interface ClientService {
  getBulbs(roomId: string): Promise<Bulb[]>;
}
