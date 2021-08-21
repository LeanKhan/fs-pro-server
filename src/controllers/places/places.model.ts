import { Schema, Document, Model, model } from 'mongoose';

export interface PlaceInterface {
  _id?: string; // Bellean. We are using the current field vals :) thank you Jesus!
  Fullname: string; // Republic of Bellean
  Name: string; // Bellean
  Code: string; // BELL
  Region: string; // east
  Type: string; // country
  Picture?: string; // ?
}

/**
 * Records like
 * 'Manager of the year: 2020 season'
 */

declare interface IPlace extends Document {
  _id: string; // Bellean. We are using the current field vals :) thank you Jesus!
  Fullname: string; // Republic of Bellean
  Name: string; // Bellean
  Code: string; // BELL
  Region: string; // east
  Type: string; // country
  Picture?: string; // ?
}

export type PlaceModel = Model<IPlace>;

export class Place {
  private _model: Model<IPlace>;

  constructor() {
    const PlaceSchema: Schema = new Schema(
      {
        Fullname: {
          type: String,
          required: true,
        },
        Name: {
          type: String,
          required: true,
        },
        Code: {
          type: String,
          required: true,
          unique: true
        },
        Region: {
          type: String
        },
        Type: {
          type: String
        },
        Picture: {
          type: String,
        }
      },
      { timestamps: true, collection: "Places", }
    );

    this._model = model<IPlace>('Place', PlaceSchema, 'Places');
  }

  public get model() {
    return this._model;
  }
}