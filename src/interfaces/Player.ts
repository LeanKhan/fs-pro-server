import { IBlock, IBall } from '../classes/Ball';

export interface IFieldPlayer extends IPlayer {
  Points: number;
  Starting: boolean;
  Substitute: boolean;
  BlockPosition: IBlock;
  StartingPosition: any | null;
  WithBall: boolean;
  Ball: IBall;
  move(pos: any): void;
  pass(pos: any): void;
  shoot(pos: any): void;
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
  Position: string;
  Attributes: {};
  Value: number;
  ClubCode: string;
}

export interface IPositions {
  top?: IBlock,
  left?: IBlock,
  right?: IBlock,
  bottom?: IBlock,
  [key: string]: IBlock | undefined;
}