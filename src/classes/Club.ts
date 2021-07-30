import { ClubInterface } from '../controllers/clubs/club.model';
import { PlayerInterface } from '../interfaces/Player';
export class Club implements ClubInterface {
  public _id: string;
  public Name: string;
  public AttackingClass: number;
  public DefensiveClass: number;
  public Manager: string;
  public Stadium: ClubInterface['Stadium'];
  public Players: PlayerInterface[];
  public Rating: number;
  public Address: ClubInterface['Address'];
  public Stats: ClubInterface['Stats'];
  public ClubCode: string;
  public GK_Rating: number;
  public ATT_Rating: number;
  public DEF_Rating: number;
  public MID_Rating: number;
  constructor(club: ClubInterface) {
    this._id = club._id as string;
    this.Name = club.Name;
    this.ClubCode = club.ClubCode;
    this.AttackingClass = club.AttackingClass;
    this.DefensiveClass = club.DefensiveClass;
    this.Stadium = club.Stadium;
    this.Manager = club.Manager;
    this.Players = club.Players;
    this.Address = club.Address;
    this.Rating = club.Rating;
    this.Stats = club.Stats;
    this.GK_Rating = club.GK_Rating;
    this.ATT_Rating = club.ATT_Rating;
    this.DEF_Rating = club.DEF_Rating;
    this.MID_Rating = club.MID_Rating;
  }
}

/**
 * a shortcut exists though...
 * class Club {
 *    constructor (public yeet: string, public skeet: string) {
 *      }
 * }
 */
