import { PlayerID } from '../types/CoveyTownSocket';

export interface Pet {
  type: string;
  playerID: string;
  equipped: boolean;
}
