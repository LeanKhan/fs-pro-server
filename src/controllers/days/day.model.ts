import DB from '../../db';
import { Schema, Document, Model, model } from 'mongoose';

export interface CalendarMatchInterface {
  Fixture: string;
  MatchType: string;
  Time: string;
  FixtureIndex: number;
  Competition: string;
  CompetitionId: string;
  Played: boolean;
  Week: number;
}

export interface DayInterface {
  Matches: CalendarMatchInterface[];
  isFree: boolean;
  Day?: number;
  Year?: string;
  Calendar?: string;
}

declare interface IDay extends Document {
  Matches: CalendarMatchInterface[];
  isFree: boolean;
  Day?: number;
  Year: string;
  Calendar: string;
}

const CalendarMatchSchema: Schema = new Schema({
  Fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
  MatchType: String,
  Time: String,
  Competition: String,
  FixtureIndex: Number,
  CompetitionId: { type: Schema.Types.ObjectId, ref: 'Competition' },
  Played: Boolean,
  Week: Number,
});

export type DayModel = Model<IDay>;

export class Day {
  private _model: Model<IDay>;

  constructor() {
    const DaySchema: Schema = new Schema(
      {
        Matches: [CalendarMatchSchema],
        isFree: Boolean,
        Day: Number,
        Year: String,
        Calendar: { type: Schema.Types.ObjectId, ref: 'Calendar' },
      },
      { timestamps: true }
    );


    // only called on Document remove
    DaySchema.post('remove', async function(next) {
      await DB.Models.Calendar.updateOne(
          { Days : this._id},
          { $pull: { Days: this._id } },
          { multi: true })  //if reference exists in multiple documents
      .exec();

      next();
  });

  // only called on Model remove 'deleteMany'
  // This middleware does not have information about the particular
  // document that was deleted. What I wanted to do was to remove all references
  // to this deleted date in all the Collections.
  // note: THINK ABOUT THIS LATER
  // DaySchema.post('deleteMany', { document: false, query: true }, function(res, next) {
  //   console.log('Res =>', res);
  //   next();
  // });


  //  DaySchema.post('deleteMany', function(res, next) {
  //   console.log('Res =>', res);
  //   next();
  // });
    this._model = model<IDay>('Day', DaySchema, 'Days');
  }

  public get model() {
    return this._model;
  }
}
