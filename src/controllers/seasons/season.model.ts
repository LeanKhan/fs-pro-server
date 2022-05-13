import { Schema, Document, model, Model } from 'mongoose';
import { CompetitionInterface } from '../competitions/competition.model';
import { Fixture } from '../fixtures/fixture.model';
import DB from '../../db';

export interface SeasonInterface {
  _id?: string;
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
}

declare interface ISeason extends Document {
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
        Logs: [Log],
      },
      { timestamps: true }
    );

    SeasonSchema.post('remove', async function(doc, next) {
      await DB.Models.Fixture.deleteMany({ Season: this._id });
      // remove all seasons in this calendar.

      await DB.Models.Competition.updateOne(
        { Seasons : this._id},
        { $pull: { Seasons: this._id } },
        { multi: true })  //if reference exists in multiple documents
        .exec();

      next();
  });

    this._model = model<ISeason>('Season', SeasonSchema, 'Seasons');
  }

  public get model() {
    return this._model;
  }
}
