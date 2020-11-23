import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball, { IBall } from '../classes/Ball';
import { MatchSide } from '../classes/MatchSide';

export interface IFieldPlayer extends IPlayer {
  Points: number;
  Substitute: boolean;
  BlockPosition: IBlock;
  /** Where the player starts the match */
  StartingPosition: IBlock;
  WithBall: boolean;
  Ball: Ball;
  // Team: MatchSide;
  move(pos: any): void;
  changePosition(pos: IBlock): void;
  pass(pos: any): void;
  shoot(pos: any): void;
  updateBallPosition(pos: any): void;
  getBlocksAround(radius: number): any[];
  increaseGoalTally(): void;
  increasePoints(pnts: number): void;
  checkNextBlocks(): IPositions;
}

export interface IPlayer {
  _id?: string;
  FirstName: string;
  LastName: string;
  Age: number;
  PlayerID: string;
  Rating: number;
  GoalsScored: number;
  ShirtNumber: string;
  isStarting: boolean;
  isSubstituted?: boolean;
  GameStats: IGameStats;
  Position: string;
  Attributes: IPlayerAttributes;
  Stats?: IPlayerStats;
  Value: number;
  isSigned: boolean;
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
  Mental: number;
  Tackling: number;
  Keeping: number;
  Control: number;
  Strength: number;
  Stamina: number;
  SetPiece: number;
  Dribbling: number;
  PreferredFoot: string;
  AttackingMindset: boolean;
  DefensiveMindset: boolean;
  [key: string]: any;
}

export interface IPlayerStats {
  _id?: string;
  Goals: number;
  Saves: number;
  YellowCards: number;
  RedCards: number;
  Passes: number;
  Tackles: number;
  Assists: number;
  CleanSheets: number;
}

export interface IGameStats extends IPlayerStats {
  Points: number;
  Dribbles: number;
}
