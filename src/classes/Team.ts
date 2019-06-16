import { Club } from '../interfaces/Club';
import {IPlayer} from '../interfaces/Player';
export class Team implements Club {
  public Name: string;
  public AttackingClass: number;
  public DefensiveClass: number;
  public Manager: string;
  public Stadium: string;
  public LeagueCode: string;
  public Players: IPlayer[];
  constructor(club: Club) {
    this.Name = club.Name;
    this.AttackingClass = club.AttackingClass;
    this.DefensiveClass = club.DefensiveClass;
    this.Stadium = club.Stadium;
    this.Manager = club.Manager;
    this.LeagueCode = club.LeagueCode;
    this.Players = club.Players;
  }
}
