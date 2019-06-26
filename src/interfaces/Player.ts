import { IBlock, IBall } from '../classes/Ball';

export interface IFieldPlayer extends IPlayer {
  Points: number;
  Starting: boolean;
  Substitute: boolean;
  BlockPosition: any | null;
  StartingPosition: any | null;
  WithBall: boolean;
  Ball: IBall;
  move(pos: any): void;
  pass(pos: any): void;
  shoot(): void;
  updateBallPosition(pos: any): void;
  checkNextBlocks(): IPositions;
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

export interface IPositions {
  top: IBlock | null,
  left: IBlock | null,
  right: IBlock | null,
  bottom: IBlock | null,
  [key: string]: IBlock | null;
}