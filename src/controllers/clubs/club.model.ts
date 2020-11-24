import { Schema, Document, model, Model } from 'mongoose';
import { IPlayer } from '../../interfaces/Player';
import { IUser } from '../user/user.model';
// import { Player } from '../models/player.model'; // Uncomment this after testing!

declare interface IClub extends Document {
  Name: string;
  ClubCode: string;
  AttackingClass: number;
  DefensiveClass: number;
  Players: IPlayer[];
  assets: {
    Kit: string;
    Logo: string;
    Stadium: string;
  };
  Rating: number;
  Address: Record<string, unknown>;
  Manager: string;
  Stadium: Record<string, unknown>;
  Stats: Record<string, unknown>;
  LeagueCode: string;
  League: string;
}

export interface ClubInterface {
  _id?: string;
  Name: string;
  ClubCode: string;
  LeagueCode?: string;
  League?: string;
  AttackingClass: number;
  DefensiveClass: number;
  Players: IPlayer[];
  assets?: {
    Kit: string;
    Logo: string;
    Stadium: string;
  };
  Rating: number;
  GK_Rating: number;
  ATT_Rating: number;
  DEF_Rating: number;
  MID_Rating: number;
  Manager: string;
  Stadium?: {
    Name: string;
    Capacity: string;
    YearOccupied: string;
    Location: string;
  };
  Stats?: {
    LeagueTitles: number;
    Cups: number;
    MatchesWon: number;
    MatchesLost: number;
    MatchesDrawn: number;
  };
  Address?: {
    Section: string;
    City: string;
    Country: string;
  };
  User?: string | IUser;
  Budget?: number;
  Transactions?: unknown; // TODO: fix, use an actual type :)
}

export type ClubModel = Model<IClub>;

export class Club {
  private _model: Model<IClub>;

  constructor() {
    const ClubSchema: Schema = new Schema(
      {
        Name: {
          type: String,
          required: true,
          unique: true,
        },
        ClubCode: {
          type: String,
          required: true,
          unique: true,
        },
        AttackingClass: {
          type: Number,
        },
        DefensiveClass: {
          type: Number,
        },
        Rating: { type: Number, default: 0 },
        GK_Rating: { type: Number, default: 0 },
        ATT_Rating: { type: Number, default: 0 },
        DEF_Rating: { type: Number, default: 0 },
        MID_Rating: { type: Number, default: 0 },
        Manager: {
          type: Schema.Types.ObjectId,
          ref: 'Manager',
        },
        assets: {
          type: Object,
          Kit: String,
          Logo: String,
          Stadium: String,
          MainColor: String,
        },
        Stats: {
          type: Object,
          LeagueTitles: Number,
          Cups: Number,
          MatchesWon: Number,
          MatchesLost: Number,
          MatchesDrawn: Number,
        },
        Address: {
          type: Object,
          Section: String,
          City: String,
          Country: String,
        },
        Budget: Number,
        Transactions: {},
        Records: [],
        Stadium: {
          type: Object,
          Name: String,
          Capacity: String,
          Location: String,
          unique: true,
        },
        LeagueCode: String,
        League: { type: Schema.Types.ObjectId, ref: 'Competition' },
        Players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        User: { type: Schema.Types.ObjectId, ref: 'User' },
      },
      { timestamps: true }
    );

    this._model = model<IClub>('Club', ClubSchema, 'Clubs');
  }

  public get model() {
    return this._model;
  }
}
