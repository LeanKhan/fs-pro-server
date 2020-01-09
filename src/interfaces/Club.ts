import { IPlayer } from './Player';

export interface IClub {
  Name: string;
  /** Club's overall Attacking rating */
  AttackingClass: number;
  /** Club's overall Defensive rating */
  DefensiveClass: number;
  /** Players */
  Players: IPlayer[];
  Rating: number;
  Address: {};
  ClubCode: string;
  Manager: string;
  Stadium: {};
  Stats: {};
  League?: string;
  LeagueCode?: string;
}
