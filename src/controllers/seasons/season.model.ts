import { Schema, Document, model, Model } from 'mongoose';
import { CompetitionInterface } from '../competitions/competition.model';
import { Fixture } from '../fixtures/fixture.model';

export interface SeasonInterface {
  _id?: string;
  SeasonID: string;
  SeasonCode: string;
  Title: string;
  Competition: string | CompetitionInterface;
  CompetitionCode: string;
  Winner: string;
  Promoted: string[];
  Relegated: string[];
  isFinished: boolean;
  isStarted: boolean;
  Status: string;
  StartDate: Date;
  EndDate: Date;
  Year: string;
  Calendar: string;
  Fixtures: Fixture[];
  Standings: WeekStandings[];
  PlayerStats: any[];
}

declare interface ISeason extends Document {
  SeasonID: string;
  SeasonCode: string;
  Title: string;
  Competition: string;
  CompetitionCode: string;
  Winner: string;
  Promoted: string[];
  Relegated: string[];
  isFinished: boolean;
  isStarted: boolean;
  Status: string;
  StartDate: Date;
  EndDate: Date;
  Fixtures: [];
  Standings: WeekStandings[];
  PlayerStats: any[];
}

export interface ClubStandings {
  ClubCode: string;
  ClubID: string;
  Points: number;
  Played: number;
  Wins: number;
  Losses: number;
  Draws: number;
  GF: number;
  GA: number;
  GD: number;
}

interface WeekStandings {
  Week: number;
  Table: ClubStandings[];
}

export type SeasonModel = Model<ISeason>;

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

const Log: Schema = new Schema({
  title: String,
  content: String,
  date: Date,
});

const WeekStandingsSchema: Schema = new Schema({
  Week: Number,
  Table: [
    {
      ClubCode: String,
      ClubID: String,
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
        EndDate: { type: Date },
        Winner: { type: Schema.Types.ObjectId, ref: 'Club' },
        Promoted: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
        Relegated: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
        isFinished: { type: Boolean, default: false },
        isStarted: { type: Boolean, default: false },
        Status: { type: String, default: 'Pending' },
        Year: String,
        Calendar: { type: Schema.Types.ObjectId, ref: 'Calendar' },
        Competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
        CompetitionCode: { type: String },
        Fixtures: [{ type: Schema.Types.ObjectId, ref: 'Fixture' }],
        Standings: [WeekStandingsSchema],
        PlayerStats: [PlayerSeasonStats],
        Logs: [Log],
      },
      { timestamps: true }
    );

    this._model = model<ISeason>('Season', SeasonSchema, 'Seasons');
  }

  public get model() {
    return this._model;
  }
}
