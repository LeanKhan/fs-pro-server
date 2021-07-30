import { PlayerInterface } from './Player';
export interface IClub {
  _id?: string;
  Name: string;
  /** Club's overall Attacking rating */
  AttackingClass: number;
  /** Club's overall Defensive rating */
  DefensiveClass: number;
  /** Players */
  Players: PlayerInterface[];
  Rating: number;
  Address: Record<string, unknown>;
  ClubCode: string;
  Manager: string;
  Stadium: Record<string, unknown>;
  Stats: Record<string, unknown>;
  League?: string;
  LeagueCode?: string;
}
