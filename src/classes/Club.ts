import { IClub } from '../interfaces/Club';
import { IPlayer } from '../interfaces/Player';
export class Club implements IClub {
  public Name: string;
  public AttackingClass: number;
  public DefensiveClass: number;
  public Manager: string;
  public Stadium: {};
  public Players: IPlayer[];
  public Rating: number;
  public Address: {};
  public Stats: {};
  constructor(club: IClub) {
    this.Name = club.Name;
    this.AttackingClass = club.AttackingClass;
    this.DefensiveClass = club.DefensiveClass;
    this.Stadium = club.Stadium;
    this.Manager = club.Manager;
    this.Players = club.Players;
    this.Address = club.Address;
    this.Rating = club.Rating;
    this.Stats = club.Stats;
  }
}
