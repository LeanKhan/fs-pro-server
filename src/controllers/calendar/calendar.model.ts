import DB from '../../db';
import { Schema, Document, model, Model } from 'mongoose';

// export interface CalendarMatch {
//   Fixture: string;
//   MatchType: string;
//   Time: string;
//   Competition: string;
//   Played: boolean;
//   Week: number;
// }

// export interface CalendarDay {
//   Matches: CalendarMatch[];
//   isFree: boolean;
//   Day?: number;
// }

export interface CalendarInterface {
  _id?: string;
  Name: string;
  /** Like JUN-2020 */
  YearString: string;
  /** Like 06-2020 */
  YearDigits: string;
  /** The present day of the year */
  CurrentDay?: number;
  /** If the Calendar is the active one */
  isActive: boolean;
  /** See if Calendar has been ended pata pata */
  isEnded: boolean;
  /** Are all Seasons completed? */
  allSeasonsCompleted: boolean;
  /** Array of the ids of Days */
  Days: string[];
}

declare interface ICalendar extends Document {
  Name: string;
  /** Like JUN-2020 */
  YearString: string;
  /** Like 06-2020 */
  YearDigits: string;
  /** The present day of the year */
  CurrentDay?: number;
  /** If the Calendar is the active one */
  isActive: boolean;
  /** See if Calendar has been ended pata pata */
  isEnded: boolean;
  /** Are all Seasons completed? */
  allSeasonsCompleted: boolean;  /** Array of the ids of Days */
  Days: string[];
}

export type CalendarModel = Model<ICalendar>;

export class Calendar {
  private _model: Model<ICalendar>;

  constructor() {
    const CalendarSchema: Schema = new Schema(
      {
        Name: String,
        YearString: String,
        YearDigits: String,
        CurrentDay: Number, // the index of the day...
        isActive: { type: Boolean, default: false },
        isEnded: { type: Boolean, default: false },
        allSeasonsCompleted: { type: Boolean, default: false },
        Days: [{ type: Schema.Types.ObjectId, ref: 'Day' }],
      },
      { timestamps: true }
    );

    CalendarSchema.post('remove', async function(doc, next) {
      await DB.Models.Day.deleteMany({ Calendar: this._id });
      // remove all seasons in this calendar.
      await DB.Models.Season.deleteMany({ Calendar: this._id });

      next();
  });

  // CalendarSchema.post('remove', { document: true, query: false }, function(res, next) {
  //   console.log('Removing doc!');
  //   next();
  // });
  // CalendarSchema.post('save', function(res, next) {
  //   console.log('Saving doc!', this);
  //   next();
  // });

    this._model = model<ICalendar>('Calendar', CalendarSchema, 'Calendars');
  }

  public get model() {
    return this._model;
  }
}
