import { Schema, Document, Model, model } from 'mongoose';

export interface CalendarMatchInterface {
  Fixture: string;
  MatchType: string;
  Time: string;
  Competition: string;
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

    this._model = model<IDay>('Day', DaySchema, 'Days');
  }

  public get model() {
    return this._model;
  }
}
