import { Schema, Document, Model, model } from 'mongoose';

export interface ManagerInterface {
  _id?: string;
  Key: string;
  FirstName: string;
  LastName: string;
  Age: number;
  Picture: string;
  Club: string;
  NationalTeam?: boolean;
  Nationality: string;
  Records: [];
  isEmployed: boolean;
}

/**
 * Records like
 * 'Manager of the year: 2020 season'
 */

declare interface IManager extends Document {
  Key: string;
  FirstName: string;
  LastName: string;
  Age: number;
  Picture: string;
  Club: string;
  NationalTeam?: boolean;
  Nationality: string;
  Records: [];
  isEmployed: boolean;
}

export interface ManagerModel extends Model<IManager> {}

export class Manager {
  private _model: Model<IManager>;

  constructor() {
    const ManagerSchema: Schema = new Schema(
      {
        Key: {
          type: String,
          unique: true,
        },
        FirstName: {
          type: String,
          required: true,
        },
        LastName: {
          type: String,
          required: true,
        },
        Age: {
          type: Number,
          default: 37,
        },
        Picture: {
          type: String,
        },
        Club: { type: Schema.Types.ObjectId, ref: 'Club' },
        NationalTeam: {
          type: Boolean,
          default: false,
        },
        Nationality: String,
        Records: [],
        isEmployed: {
          type: Boolean,
        },
      },
      { timestamps: true }
    );

    this._model = model<IManager>('Manager', ManagerSchema, 'Managers');
  }

  public get model() {
    return this._model;
  }
}
