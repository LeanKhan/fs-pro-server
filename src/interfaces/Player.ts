import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from '../classes/Ball';

export interface IFieldPlayer extends PlayerInterface {
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

export interface PlayerInterface {
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
  Value: number;
  /** This is the average players points in previous matches. It resets at the end of the season... */
  Form?: number;
  isSigned: boolean;
  ClubCode?: string;
  Club?: string;
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
  Vision: number;
  ShotPower: number;
  Aggression: number;
  Interception: number;
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
  Fouls: number;
  Points: number;
  Dribbles: number;
}

export enum IPlayingPosition {
  'ATT',
  'DEF',
  'GK',
  'MID',
}

export const AttackerMultipliers: Multipliers = {
  Speed: 0.11,
  Shooting: 0.32,
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08,
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0,
  SetPiece: 0.04,
  Dribbling: 0.1,
};

export const GoalkeeperMultipliers: Multipliers = {
  Speed: 0.0,
  Shooting: 0.0,
  LongPass: 0.08,
  ShortPass: 0.04,
  Mental: 0.05,
  Control: 0.05,
  Tackling: 0.0,
  Strength: 0.05,
  Stamina: 0.03,
  Keeping: 0.7,
  SetPiece: 0.0,
  Dribbling: 0.0,
};

export const MidfielderMultipliers: Multipliers = {
  Speed: 0.05,
  Shooting: 0.1,
  LongPass: 0.2,
  ShortPass: 0.2,
  Mental: 0.1,
  Control: 0.08,
  Tackling: 0.02,
  Strength: 0.04,
  Stamina: 0.08,
  Keeping: 0,
  SetPiece: 0.04,
  Dribbling: 0.09,
};

export const DefenderMultipliers: Multipliers = {
  Speed: 0.04,
  Shooting: 0.01,
  LongPass: 0.05,
  ShortPass: 0.05,
  Mental: 0.1,
  Control: 0.07,
  Tackling: 0.42,
  Strength: 0.2,
  Stamina: 0.04,
  Keeping: 0.0,
  SetPiece: 0.02,
  Dribbling: 0.0,
};

export interface Multipliers {
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
}
