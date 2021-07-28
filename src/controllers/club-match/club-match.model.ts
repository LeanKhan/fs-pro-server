import { Schema, Document, Model, model } from 'mongoose';
import { Fixture } from '../fixtures/fixture.model';
import { IClub } from '../../interfaces/Club';
import { PlayerMatchDetailsInterface } from '../player-match/player-match.model';

const MatchEventSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['match', 'shot', 'miss', 'save', 'goal', 'dribble', 'tackle'],
  },
  message: String,
  time: String,
  playerID: String,
  playerTeamID: String,
  data: {},
});

export interface ClubMatchDetailsInterface {
  _id?: string;
  Club: string | IClub;
  Fixture: string | Fixture;
  TimesWithBall: number;
  Possession: number;
  Goals: number;
  ShotsOnTarget: number;
  ShotsOffTarget: number;
  Fouls: number;
  YellowCards: number;
  RedCards: number;
  Passes: number;
  PlayerStats: string[] | PlayerMatchDetailsInterface[];
  Won: boolean;
  Drew: boolean;
  Events: typeof MatchEventSchema[];
}

/**
 * Records like
 * 'ClubMatchDetails of the year: 2020 season'
 */

declare interface IClubMatchDetails extends Document {
  _id?: string;
  Club?: string | IClub;
  Fixture?: string | Fixture;
  TimesWithBall: number;
  Possession: number;
  Goals: number;
  ShotsOnTarget: number;
  ShotsOffTarget: number;
  Fouls: number;
  YellowCards: number;
  RedCards: number;
  Passes: number;
  PlayerStats: string[] | PlayerMatchDetailsInterface[];
  Won: boolean;
  Drew: boolean;
  Events: typeof MatchEventSchema[];
}

export type ClubMatchDetailsModel = Model<IClubMatchDetails>;

export class ClubMatchDetails {
  private _model: Model<IClubMatchDetails>;

  constructor() {
    const ClubMatchDetailsSchema: Schema = new Schema(
      {
        Club: { type: Schema.Types.ObjectId, ref: 'Club' },
        Fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
        Possession: {
          type: Number,
          default: 0,
        },
        Goals: {
          type: Number,
          default: 0,
        },
        ShotsOnTarget: {
          type: Number,
          default: 0,
        },
        ShotsOffTarget: {
          type: Number,
          default: 0,
        },
        Fouls: {
          type: Number,
          default: 0,
        },
        YellowCards: {
          type: Number,
          default: 0,
        },
        RedCards: {
          type: Number,
          default: 0,
        },
        Passes: {
          type: Number,
          default: 0,
        },
        PlayerStats: [
          { type: Schema.Types.ObjectId, ref: 'PlayerMatchDetails' },
        ],
        Won: { type: Boolean, default: false },
        Drew: { type: Boolean, default: false },
        Events: [MatchEventSchema],
      },
      { timestamps: true }
    );

    this._model = model<IClubMatchDetails>(
      'ClubMatchDetails',
      ClubMatchDetailsSchema,
      'ClubMatchDetails'
    );
  }

  public get model() {
    return this._model;
  }
}
