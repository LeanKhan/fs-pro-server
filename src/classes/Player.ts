import { IPlayer, IPlayerAttributes } from '../interfaces/Player';

export default class Player implements IPlayer {
  public FirstName: string;
  public LastName: string;
  public Age: string;
  public PlayerID: string;
  public Rating: number;
  public GoalsScored: number;
  public ShirtNumber: string;
  public AttackingClass: number;
  public DefensiveClass: number;
  public GoalkeepingClass: number;
  public Position: string;
  public Attributes: IPlayerAttributes;
  public Value: number;
  public ClubCode: string;

  constructor(player: Player) {
    this.FirstName = player.FirstName;
    this.LastName = player.LastName;
    this.Age = player.Age;
    this.PlayerID = player.PlayerID;
    this.Rating = player.Rating;
    this.GoalsScored = player.GoalsScored;
    this.ShirtNumber = player.ShirtNumber;
    this.AttackingClass = player.AttackingClass;
    this.DefensiveClass = player.DefensiveClass;
    this.GoalkeepingClass = player.GoalkeepingClass;
    this.Position = player.Position;
    this.Attributes = player.Attributes;
    this.Value = player.Value;
    this.ClubCode = player.ClubCode;
  }
}
