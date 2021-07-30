import { Schema, Document, Model, model } from 'mongoose';

/** MODEL */
export interface AwardInterface {
  _id?: string;
  Name: string;
  Type: 'manager' | 'player'; // award is for club/manager/player
  Period: 'season' | 'year' | 'all-time';
  Category: string;
  Recipient: string;
  Club: string;
  Remarks: string;
  Season: string;
}

/**
 * Records like
 * 'Award of the year: 2020 season'
 */

declare interface IAward extends Document {
  Name: string;
  Type: string; // club/manager/player
  Category: string; // superlative-attribute/object. e.g 'best-player' or 'most-goals'
  Period: string; // period the award is valid e.g 'season', 'year', 'all time'
  Recipient: string;
  Club: string;
  Remarks: string;
  Season: string;
}

export type AwardModel = Model<IAward>;

export class Award {
  private _model: Model<IAward>;

  constructor() {
    const AwardSchema: Schema = new Schema(
      {
        Name: String,
        Type: String, // club/manager/player
        Category: String,
        Period: String,
        Remarks: String,
        Recipient: { type: Schema.Types.ObjectId },
        Club: { type: Schema.Types.ObjectId, ref: 'Club' },
        Season: { type: Schema.Types.ObjectId, ref: 'Season' },
      },
      { timestamps: true }
    );

    this._model = model<IAward>('Award', AwardSchema, 'Awards');
  }

  public get model() {
    return this._model;
  }
}
