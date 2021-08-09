import DB from '../../db';
import respond from '../../helpers/responseHandler';
import { Request, Response } from 'express';
import { Schema, Document, Model, model } from 'mongoose';

/** MODEL */
export interface CountryInterface {
  _id?: string;
  Name: string;
  ShortCode: string;
  Region: string;
}

/**
 * Records like
 * 'Country of the year: 2020 season'
 */

declare interface ICountry extends Document {
  Name: string;
  ShortCode: string;
  Region: string;
}

export type CountryModel = Model<ICountry>;

export class Country {
  private _model: Model<ICountry>;

  constructor() {
    const CountrySchema: Schema = new Schema(
      {
        Name: String,
        ShortCode: String,
        Region: String,
      },
      { timestamps: true }
    );

    this._model = model<ICountry>('Country', CountrySchema, 'Countries');
  }

  public get model() {
    return this._model;
  }
}
