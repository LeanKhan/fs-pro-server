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
  Age: number;
  PlayerID: string;
  Rating: number;
  GoalsScored: number;
  ShirtNumber: string;
  Position: string;
  Attributes: IPlayerAttributes;
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
  Catching: number;
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
  Goals: number;
  Saves: number;
  YellowCards: number;
  RedCards: number;
  Assists: number;
  CleanSheets: number;
}
