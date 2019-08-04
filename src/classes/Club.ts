import { IClub } from '../interfaces/Club';
import {IPlayer} from '../interfaces/Player';
export class Club implements IClub {
  public Name: string;
  public AttackingClass: number;
  public DefensiveClass: number;
  public PlayingStyle: 'attacking' | 'defensive' | 'balanced';
  public Manager: string;
  public Stadium: string;
  public LeagueCode: string;
  public Players: IPlayer[];
  constructor(club: IClub) {
    this.Name = club.Name;
    this.AttackingClass = club.AttackingClass;
    this.DefensiveClass = club.DefensiveClass;
    this.PlayingStyle = club.PlayingStyle;
    this.Stadium = club.Stadium;
    this.Manager = club.Manager;
    this.LeagueCode = club.LeagueCode;
    this.Players = club.Players;
  }
}
