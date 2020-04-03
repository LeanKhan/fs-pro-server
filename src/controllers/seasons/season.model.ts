import { Schema, Document, model, Model } from 'mongoose';
import { IPlayerStats } from '../../interfaces/Player';

declare interface ISeason extends Document {
  SeasonID: string;
  SeasonCode: string;
  Title: string;
  Competition: string;
  CompetitionCode: string;
  Winner: string;
  isFinished: boolean;
  isStarted: boolean;
  Fixtures: [];
  Standings: [];
  PlayerStats: PlayerSeasonStats[];
}

export interface SeasonModel extends Model<ISeason> {}

export interface PlayerSeasonStats extends IPlayerStats {
  PlayerID: string;
  Player: string;
  MOTM: number;
}

export class Season {
  private _model: Model<ISeason>;

  constructor() {
    const SeasonSchema: Schema = new Schema(
      {
        SeasonID: { type: String, unique: true },
        SeasonCode: { type: String, unique: true },
        Title: { type: String },
        StartDate: { type: String },
        Winner: { type: String },
        isFinished: { type: Boolean, default: false },
        isStarted: { type: Boolean, default: false },
        EndDate: { type: String },
        Competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
        CompetitionCode: { type: String },
        Fixtures: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }],
        Standings: { type: Array },
        PlayerStats: [
          {
            type: Schema.Types.Mixed,
            PlayerID: String,
            Player: String,
            MOTM: Number,
          },
        ],
      },
      { timestamps: true }
    );

    this._model = model<ISeason>('Season', SeasonSchema, 'Seasons');
  }

  public get model() {
    return this._model;
  }
}
