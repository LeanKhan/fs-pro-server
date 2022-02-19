import { IBlock } from '../state/ImmutableState/FieldGrid';
import Ball from '../classes/Ball';
import { Role } from '../controllers/players/player.model';

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
  Role: Role;
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
  // new 03-02-22
  Marking: number;
  Agility: number;
  Crossing: number;
  Positioning: number;
  LongShot: number;
  // new 03-02-22
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

export const ST_Multipliers: Multipliers = {
  Speed: 0.1, // -1
  Shooting: 0.3, // -12
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08, // Positioning
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.1,
  Aggression: 0.0,
  Vision: 0.03, // +0.03
  Interception: 0.0,
  ShotPower: 0.1, // +0.10
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};

export const LW_Multipliers: Multipliers = {
  Speed: 0.1, // -1
  Shooting: 0.3, // -12
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08, // Positioning
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.1,
  Aggression: 0.0,
  Vision: 0.03, // +0.03
  Interception: 0.0,
  ShotPower: 0.1, // +0.10
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};

export const RW_Multipliers: Multipliers = {
  Speed: 0.1, // -1
  Shooting: 0.3, // -12
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08, // Positioning
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.1,
  Aggression: 0.0,
  Vision: 0.03, // +0.03
  Interception: 0.0,
  ShotPower: 0.1, // +0.10
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};

export const CB_Multipliers: Multipliers = {
  Speed: 0.0,
  Shooting: 0.0, // half of Heading
  LongPass: 0.0,
  ShortPass: 0.05,
  Mental: 0.05, // Reactions
  Control: 0.05,
  Tackling: 0.3, // Stading and Sliding Tackle: 0.30
  Strength: 0.15, // +0.05 from half of Heading
  Stamina: 0.0,
  Keeping: 0.0,
  SetPiece: 0.0,
  Dribbling: 0.0,
  Aggression: 0.08,
  Vision: 0.0,
  Interception: 0.08,
  ShotPower: 0.0,
  Marking: 0.15,
  Agility: 0.04, // Jumping
  Crossing: 0.0,
  Positioning: 0.05, // half of heading
  LongShot: 0.0,
};

// TODO: CONTINUE TOMOROWW BY GOD'S GRACE, ORLATER SEF. nNOT A PRIIORIY!
export const LB_RB_Multipliers: Multipliers = {
  Speed: 0.05, // -1
  Shooting: 0.0, // -12
  LongPass: 0.0,
  ShortPass: 0.06,
  Mental: 0.08, // Reactions
  Control: 0.07,
  Tackling: 0.25,
  Strength: 0.035,
  Stamina: 0.08,
  Keeping: 0.0,
  SetPiece: 0.0,
  Dribbling: 0.0,
  Aggression: 0.05,
  Vision: 0.0, // +0.03
  Interception: 0.12,
  ShotPower: 0.0, // +0.10
  Marking: 0.1,
  Agility: 0.0,
  Crossing: 0.07,
  Positioning: 0.035,
  LongShot: 0.0,
};

export const LM_Multipliers: Multipliers = {
  Speed: 0.1, // -1
  Shooting: 0.3, // -12
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08, // Positioning
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.1,
  Aggression: 0.0,
  Vision: 0.03, // +0.03
  Interception: 0.0,
  ShotPower: 0.1, // +0.10
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};

export const RM_Multipliers: Multipliers = {
  Speed: 0.1, // -1
  Shooting: 0.3, // -12
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08, // Positioning
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.1,
  Aggression: 0.0,
  Vision: 0.03, // +0.03
  Interception: 0.0,
  ShotPower: 0.1, // +0.10
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};

export const CM_Multipliers: Multipliers = {
  Speed: 0.1, // -1
  Shooting: 0.3, // -12
  LongPass: 0.02,
  ShortPass: 0.03,
  Mental: 0.08, // Positioning
  Control: 0.18,
  Tackling: 0.01,
  Strength: 0.06,
  Stamina: 0.05,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.1,
  Aggression: 0.0,
  Vision: 0.03, // +0.03
  Interception: 0.0,
  ShotPower: 0.1, // +0.10
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};
export const CAM_Multipliers: Multipliers = {
  Speed: 0.05,
  Shooting: 0.1,
  LongPass: 0.2,
  ShortPass: 0.2,
  Mental: 0.1, // Positioning
  Control: 0.08,
  Tackling: 0.02,
  Strength: 0.04,
  Stamina: 0.08,
  Keeping: 0.0,
  SetPiece: 0.04,
  Dribbling: 0.09,
  Aggression: 0.0,
  Vision: 0.0,
  Interception: 0.0,
  ShotPower: 0.0,
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};

export const CDM_Multipliers: Multipliers = {
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
  Aggression: 0,
  Vision: 0,
  Interception: 0,
  ShotPower: 0,
  //
  Marking: 0.0,
  Agility: 0.0,
  Crossing: 0.0,
  Positioning: 0.0,
  LongShot: 0.0,
};
export const GK_Multipliers: Multipliers = {
  Speed: 0.0,
  Shooting: 0.0,
  LongPass: 0.04, // GK Kicking
  ShortPass: 0.0,
  Mental: 0.06, // Reactions
  Control: 0.0,
  Tackling: 0.0,
  Strength: 0.0,
  Stamina: 0.0,
  Keeping: 0.44, // GK Reflex 0.22, + GK Handling 0.22 = 0.44
  SetPiece: 0.0,
  Dribbling: 0.0,
  Aggression: 0,
  Vision: 0.0,
  Interception: 0.0,
  ShotPower: 0.0,
  //
  Marking: 0.0,
  Agility: 0.24, // Diving
  Crossing: 0.0,
  Positioning: 0.22, // GK Positioning
  LongShot: 0.0,
};

export const AllMultipliers: Record<Role, Multipliers> = {
  GK: GK_Multipliers,
  LW: LW_Multipliers,
  RW: RW_Multipliers,
  ST: ST_Multipliers,
  LB: LB_RB_Multipliers,
  RB: LB_RB_Multipliers,
  CB: CB_Multipliers,
  CM: CM_Multipliers,
  CAM: CAM_Multipliers,
  CDM: CDM_Multipliers,
  RM: RM_Multipliers,
  LM: LM_Multipliers,
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
  Aggression: number;
  Vision: number;
  Interception: number;
  ShotPower: number;
  // new 27-08-21
  Marking: number;
  Agility: number;
  Crossing: number;
  Positioning: number;
  LongShot: number;
  // new
  [key: string]: number;
}
