import { PlayerInterface } from '../../interfaces/Player';
import { Schema, Document, Model, model } from 'mongoose';
import { Fixture } from '../fixtures/fixture.model';

export interface PlayerMatchDetailsInterface {
  _id?: string;
  Player?: string | PlayerInterface;
  Fixture?: string | Fixture;
  Goals: number;
  Saves: number;
  YellowCards: number;
  Fouls: number;
  RedCards: number;
  Passes: number;
  Tackles: number;
  Assists: number;
  CleanSheets: number;
  Points: number;
  Dribbles: number;
  Interceptions: number;
  Form?: number;
  [key: string]: any;
}

/**
 * Records like
 * 'PlayerMatchDetails of the year: 2020 season'
 */

declare interface IPlayerMatchDetails extends Document {
  _id?: string;
  Player: string | PlayerInterface;
  Fixture: string | Fixture;
  Goals: number;
  Saves: number;
  YellowCards: number;
  Fouls: number;
  RedCards: number;
  Passes: number;
  Tackles: number;
  Assists: number;
  CleanSheets: number;
  Points: number;
  Dribbles: number;
  Interceptions: number;
  Form: number;
}

export type PlayerMatchDetailsModel = Model<IPlayerMatchDetails>;

export class PlayerMatchDetails {
  private _model: Model<IPlayerMatchDetails>;

  constructor() {
    const PlayerMatchDetailsSchema: Schema = new Schema(
      {
        Player: { type: Schema.Types.ObjectId, ref: 'Player' },
        Fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
        Goals: {
          type: Number,
          default: 0,
        },
        Saves: {
          type: Number,
          default: 0,
        },
        YellowCards: {
          type: Number,
          default: 0,
        },
        Fouls: {
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
        Tackles: {
          type: Number,
          default: 0,
        },
        Assists: {
          type: Number,
          default: 0,
        },
        CleanSheets: {
          type: Number,
          default: 0,
        },
        Points: {
          type: Number,
          default: 0,
        },
        Dribbles: {
          type: Number,
          default: 0,
        },
        Interceptions: {
          type: Number,
          default: 0,
        },
        Form: {
          type: Number,
          default: 0,
        },
      },
      { timestamps: true }
    );

    this._model = model<IPlayerMatchDetails>(
      'PlayerMatchDetails',
      PlayerMatchDetailsSchema,
      'PlayerMatchDetails'
    );
  }

  public get model() {
    return this._model;
  }
}
