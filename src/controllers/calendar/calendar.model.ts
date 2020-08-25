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
  Name: string;
  /** Like JUN-2020 */
  YearString: string;
  /** Like 06-2020 */
  YearDigits: string;
  /** The present day of the year */
  CurrentDay?: number;
  /** If the Calendar is the active one */
  isActive: boolean;
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
  /** Array of the ids of Days */
  Days: string[];
}

export interface CalendarModel extends Model<ICalendar> {}

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
        Days: [{ type: Schema.Types.ObjectId, ref: 'Day' }],
      },
      { timestamps: true }
    );

    this._model = model<ICalendar>('Calendar', CalendarSchema, 'Calendars');
  }

  public get model() {
    return this._model;
  }
}
