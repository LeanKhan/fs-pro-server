import {
  PlayerInterface,
  IPlayerAttributes,
  IGameStats
} from '../interfaces/Player';

import { Role } from '../controllers/players/player.model';
export default class Player implements PlayerInterface {
  public _id?: string;
  public FirstName: string;
  public LastName: string;
  public Age: number;
  public PlayerID: string;
  public Rating: number;
  public GoalsScored: number;
  public ShirtNumber: string;
  public Position: string;
  public Attributes: IPlayerAttributes;
  public Value: number;
  public isSigned: boolean;
  public ClubCode?: string;
  public isStarting: boolean;
  public isSubstituted?: boolean;
  public Role: Role;
  public GameStats: IGameStats;

  constructor(player: Player) {
    this._id = player._id;
    this.FirstName = player.FirstName;
    this.LastName = player.LastName;
    this.Age = player.Age;
    this.PlayerID = player.PlayerID;
    this.Rating = player.Rating;
    this.GoalsScored = player.GoalsScored;
    this.ShirtNumber = player.ShirtNumber;
    this.Position = player.Position;
    this.isSigned = player.isSigned;
    this.Attributes = player.Attributes;
    this.Value = player.Value;
    this.ClubCode = player.ClubCode;
    this.Role = player.Role;
    this.isStarting = false;
    this.GameStats = {
      Goals: 0,
      Saves: 0,
      YellowCards: 0,
      RedCards: 0,
      Assists: 0,
      CleanSheets: 0,
      Points: 6,
      Passes: 0,
      Tackles: 0,
      Dribbles: 0,
      Interceptions: 0,
      Fouls: 0,
    };
  }
}
