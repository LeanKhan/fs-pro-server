import { IPlayer } from './Player';

export interface IClub {
  Name: string;
  /** Club's overall Attacking rating */
  AttackingClass: number;
  /** Club's overall Defensive rating */
  DefensiveClass: number;
  /** Style of play */
  PlayingStyle: 'attacking' | 'defensive' | 'balanced';
  Players: IPlayer[];
  Manager: string;
  Stadium: string;
  LeagueCode: string;
}
