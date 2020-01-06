import { IPlayer } from './Player';

export interface IClub {
  Name: string;
  /** Club's overall Attacking rating */
  AttackingClass: number;
  /** Club's overall Defensive rating */
  DefensiveClass: number;
  /** Style of play */
  Players: IPlayer[];
  Rating: number;
  Address: {};
  Manager: string;
  Stadium: {};
  Stats: {};
  League?: string;
  LeagueCode?: string;
}
