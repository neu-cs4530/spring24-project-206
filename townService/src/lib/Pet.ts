import { PlayerID } from '../types/CoveyTownSocket';

export interface Pet {
  type: string;
  playerID: PlayerID;
  equipped: boolean;
}
