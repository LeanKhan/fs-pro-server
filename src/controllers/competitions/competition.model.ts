// tslint:disable: variable-name
import { Schema, model, Document, Model } from 'mongoose';
import { ClubInterface } from '../clubs/club.model';
import DB from '../../db';

export interface CompetitionInterface {
  _id?: string;
  Type: string;
  Name: string;
  CompetitionID: string;
  CompetitionCode: string;
  Country: string;
  League: boolean;
  Tournament: boolean;
  Cup: boolean;
  Division: 1 | 2 | 3 | 0;
  NumberOfTeams: number;
  NumberOfWeeks: number;
  TeamsRelegated?: number;
  TeamsPromoted?: number;
  Clubs: ClubInterface[] | string[];
  Seasons: [];
}

declare interface ICompetition extends Document {
  Type: 'league' | 'cup' | 'tournament';
  Name: string;
  CompetitionID: string;
  CompetitionCode: string;
  Country: string;
  League: boolean;
  Tournament: boolean;
  Division: 1 | 2 | 3 | 0;
  Cup: boolean;
  NumberOfTeams: number;
  NumberOfWeeks: number;
  TeamsRelegated?: number;
  TeamsPromoted?: number;
  Clubs: [];
  Seasons: [];
}

export type CompetitionModel = Model<ICompetition>;

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
        TeamsPromoted: Number,
        TeamsRelegated: Number,
        Country: {
          type: Schema.Types.ObjectId,
          ref: 'Place',
          autopopulate: true,
        },
        Division: {
          type: Number,
          default: 0,
          enum: [1, 2, 3, 0],
        },
        Clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
        Seasons: [{ type: Schema.Types.ObjectId, ref: 'Season' }],
      },
      { timestamps: true }
    );

    const populate = function (next: any) {
      this.populate('Country');
      next();
    };

    CompetitionSchema.pre('find', populate).pre('findOne', populate);

    CompetitionSchema.post('remove', async function(doc, next) {

      await DB.Models.Season.deleteMany({ Competition: this._id });

      await DB.Models.Club.updateOne(
        { League: this._id },
        { $unset: { League: 1 } }
      ).exec();

      next();
  });


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
