// tslint:disable: variable-name
import { Schema, model, Document, Model } from 'mongoose';
import { Club } from '../clubs/club.model';

export interface Competition {
  Type: string;
  Title: string;
  CompetitionID: string;
  CompetitionCode: string;
  League: boolean;
  Tournament: boolean;
  Cup: boolean;
  NumberOfTeams: number;
  NumberOfWeeks: number;
  Clubs: Club[];
  Seasons: [];
}

declare interface ICompetition extends Document {
  Type: 'league' | 'cup' | 'tournament';
  Title: string;
  CompetitionID: string;
  CompetitionCode: string;
  League: boolean;
  Tournament: boolean;
  Cup: boolean;
  NumberOfTeams: number;
  NumberOfWeeks: number;
  Clubs: [];
  Seasons: [];
}

export interface CompetitionModel extends Model<ICompetition> {}

export class Competition {
  private _model: Model<ICompetition>;

  constructor() {
    const CompetitionSchema: Schema = new Schema(
      {
        Name: String,
        League: { type: Boolean, default: false },
        Tournament: { type: Boolean, default: false },
        Cup: { type: Boolean, default: false },
        Type: String,
        CompetitionCode: { type: String, unique: true },
        CompetitionID: { type: String, unique: true },
        NumberOfTeams: Number,
        NumberOfWeeks: Number,
        Country: String,
        Division: {
          type: String,
          default: 'none',
          enum: ['first', 'second', 'third', 'none'],
        },
        Clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
        Seasons: [{ type: Schema.Types.ObjectId, ref: 'Season' }],
      },
      { timestamps: true }
    );

    this._model = model<ICompetition>(
      'Competition',
      CompetitionSchema,
      'Competitions'
    );
  }

  public get model(): Model<ICompetition> {
    return this._model;
  }
}

// Do a pre-save where we check the type of competition and set the default values
// for NumberOfTeams? Nah...
