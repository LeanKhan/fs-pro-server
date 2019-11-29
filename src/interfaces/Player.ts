import { IBlock, IBall } from '../classes/Ball';
import { MatchSide } from '../classes/MatchSide';

export interface IFieldPlayer extends IPlayer {
  Points: number;
  Starting: boolean;
  Substitute: boolean;
  BlockPosition: IBlock;
  /** Where the player starts the match */
  StartingPosition: any | null;
  WithBall: boolean;
  Ball: IBall;
  Team: MatchSide;
  move(pos: any): void;
  pass(pos: any): void;
  shoot(pos: any): void;
  updateBallPosition(pos: any): void;
  getBlocksAround(radius: number): any[];
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
  Attributes: IPlayerAttributes;
  Value: number;
  ClubCode?: string;
}

// It's not all players that will have club :)

export interface IPositions {
  top?: IBlock;
  left?: IBlock;
  right?: IBlock;
  bottom?: IBlock;
  [key: string]: IBlock | undefined;
}

export interface IPlayerAttributes {
  Speed: number;
  Shooting: number;
  LongPass: number;
  ShortPass: number;
  MediumPass: number;
  Tactics: number;
  Tackling: number;
  Strength: number;
  Stamina: number;
  PreferredFoot: string;
  AttackingMindset: boolean;
  DefensiveMindset: boolean;
  [key: string]: any;
}
