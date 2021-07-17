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

/** SERVICES  */
export function fetchAll(
  query: Record<string, unknown> = {}
): Promise<CountryInterface[]> {
  return DB.Models.Country.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific Country by id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate = false
): Promise<CountryInterface> {
  if (populate) {
    return DB.Models.Country.findById(id).populate('Club').lean().exec();
  }
  return DB.Models.Country.findById(id).lean().exec();
}

/**
 * Fetch one specific Country by a query
 *
 * Fetch a specific Country by id
 * @param query
 */
export function fetchOne(query: any): Promise<CountryInterface> {
  return DB.Models.Country.findOne(query).lean().exec();
}

/** ROUTER */
export function allCountries(req: Request, res: Response) {
  fetchAll({})
    .then((countries) => {
      respond.success(res, 200, 'Countries fetched successfully', countries);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Countries', err);
    });
}
