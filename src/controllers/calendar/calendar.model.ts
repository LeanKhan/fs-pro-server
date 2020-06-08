import { Schema, Document, model, Model } from 'mongoose';

export interface CalendarMatch {
  Fixture: string;
  MatchType: string;
  Time: string;
  Competition: string;
  Played: boolean;
}

export interface CalendarDay {
  Matches: CalendarMatch[];
  isFree: boolean;
}

export interface CalendarInterface {
  Name: string;
  YearString: string; // june-2020
  YearDigits: string; // 06-2020
  CurrentDay: number;
  Days: CalendarDay[];
}

declare interface ICalendar extends Document {
  Name: string;
  YearString: string; // june-2020
  YearDigits: string; // 06-2020
  CurrentDay: number;
  Days: CalendarDay[];
}

const CalendarMatchSchema: Schema = new Schema({
  Fixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
  MatchType: String,
  Time: String,
  Competition: String,
  Played: Boolean,
});

const CalendarDaySchema: Schema = new Schema({
  Matches: [CalendarMatchSchema],
  isFree: Boolean,
});

export interface CalendarModel extends Model<ICalendar> {}

export class Calendar {
  private _model: Model<ICalendar>;

  constructor() {
    const CalendarSchema: Schema = new Schema(
      {
        Name: String,
        YearString: String,
        YearDigits: String,
        CurrentDay: String, // Should be the _id of a Day of type CalendarDaySchema...
        Days: [CalendarDaySchema],
      },
      { timestamps: true }
    );

    this._model = model<ICalendar>('Calendar', CalendarSchema, 'Calendars');
  }

  public get model() {
    return this._model;
  }
}
