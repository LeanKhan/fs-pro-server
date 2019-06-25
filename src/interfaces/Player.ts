export interface IFieldPlayer extends IPlayer {
  Points: number;
  Starting: boolean;
  Substitute: boolean;
  BlockPosition: any | null;
  StartingPosition: any | null;
  BallPosition: any;
  WithBall: boolean;
  move(pos: any): void;
  pass(pos: any): void;
  shoot(): void;
  updateBallPosition(pos: any): void;
}

export interface IPlayer {
  _id?: string;
  FirstName: string;
  LastName: string;
  Age: string;
  PlayerID: string;
  Rating: number;
  GoalsScored: number;
  ShirtNumber: string;
  AttackingClass: number;
  DefensiveClass: number;
  GoalkeepingClass: number;
  Attributes: {};
  Value: number;
  ClubCode: string;
}
