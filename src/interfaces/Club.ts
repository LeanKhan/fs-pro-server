import { IPlayer } from './Player';

export interface IClub {
  Name: string;
  AttackingClass: number;
  DefensiveClass: number;
  PlayingStyle: 'attacking' | 'defensive' | 'balanced';
  Players: IPlayer[];
  Manager: string;
  Stadium: string;
  LeagueCode: string;
}
