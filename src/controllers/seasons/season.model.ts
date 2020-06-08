import { Schema, Document, model, Model } from 'mongoose';

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
  PlayerStats: any[];
}

export interface SeasonModel extends Model<ISeason> {}

const PlayerSeasonStats: Schema = new Schema({
  Goals: Number,
  Saves: Number,
  YellowCards: Number,
  RedCards: Number,
  Passes: Number,
  Tackles: Number,
  Assists: Number,
  CleanSheets: Number,
  PlayerID: String,
  Player: String,
  MOTM: Number,
});

const WeekStandingsSchema: Schema = new Schema({
  Week: Number,
  Table: [
    {
      ClubCode: String,
      Points: Number,
      Played: Number,
      Wins: Number,
      Losses: Number,
      Draws: Number,
      GF: Number,
      GA: Number,
      GD: Number,
    },
  ],
});

export class Season {
  private _model: Model<ISeason>;

  constructor() {
    const SeasonSchema: Schema = new Schema(
      {
        SeasonID: { type: String, unique: true },
        SeasonCode: { type: String, unique: true },
        Title: { type: String },
        StartDate: { type: Date },
        Winner: { type: String },
        isFinished: { type: Boolean, default: false },
        isStarted: { type: Boolean, default: false },
        Year: String,
        EndDate: { type: Date },
        Competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
        CompetitionCode: { type: String },
        Fixtures: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }],
        Standings: [WeekStandingsSchema],
        PlayerStats: [PlayerSeasonStats],
      },
      { timestamps: true }
    );

    this._model = model<ISeason>('Season', SeasonSchema, 'Seasons');
  }

  public get model() {
    return this._model;
  }
}
