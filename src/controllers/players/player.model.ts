import { Schema, Document, model, Model } from 'mongoose';
import { IPlayerAttributes } from '../../interfaces/Player';
import DB from '../../db';

export interface PlayerInterface {
  /** Name of the Player! */
  _id?: string;
  FirstName: string;
  LastName: string;
  Age: number;
  PlayerID: string;
  /** overall Player rating */
  Rating: number;
  /** Goals scored in total */
  GoalsScored: number;
  ShirtNumber: string;
  Position: string;
  /** Collecting of Player's attributes */
  Role: Role;
  Attributes: IPlayerAttributes;
  isSigned: boolean;
  /** Monetary value of Player */
  Value: number;
  /** Some Players don't have clubs (free agents) hence can be undefined */
  ClubCode?: string;
  Club?: string;
}

export declare interface IPlayer extends Document {
  /** Name of the Player! */
  FirstName: string;
  LastName: string;
  Age: number;
  PlayerID: string;
  /** overall Player rating */
  Rating: number;
  /** Goals scored in total */
  GoalsScored: number;
  ShirtNumber: string;
  /** Collecting of Player's attributes */
  Role: string;
  Attributes: IPlayerAttributes;
  isSigned: boolean;
  /** Monetary value of Player */
  Value: number;
  /** Some Players don't have clubs (free agents) hence can be undefined */
  ClubCode?: string;
  Club?: string;
}

export type PlayerModel = Model<IPlayer>;

const PlayerTransferHistorySchema: Schema = new Schema({
  message: String,
  type: String,
  amount: Number,
  from: String,
  to: String,
  date: String,
});

const PlayerRatingsHistory: Schema = new Schema({
  date: String,
  calendar: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  rating: Number,
  value: Number,
  old_rating: Number,
  old_value: Number,
});

const PlayerAppearanceSchema: Schema = new Schema({
  head: {
    type: Object,
    variant: { type: String, default: 'default' },
    style: { type: String, default: 'light' },
  },
  complexion: {
    type: String,
    default: 'light',
  },
  hair: {
    type: Object,
    variant: { type: String, default: 'default' },
    style: { type: String, default: 'brown' },
  },
  eyebrows: {
    type: Object,
    variant: { type: String, default: 'default' },
    style: { type: String, default: 'brown' },
  },
  eyes: {
    type: Object,
    variant: { type: String, default: 'default' },
    style: { type: String, default: 'black' },
  },
  nose: {
    type: Object,
    variant: { type: String, default: 'default' },
    style: { type: String, default: 'light' },
  },
  mouth: {
    type: Object,
    variant: { type: String, default: 'default' },
    style: { type: String, default: 'light' },
  },
});

export enum Positions {
  ATT = 'ATT',
  DEF = 'DEF',
  MID = 'MID',
  GK = 'GK',
}

export const roles = [
  'LW',
  'RW',
  'ST',
  'LB',
  'RB',
  'CB',
  'CM',
  'CAM',
  'CDM',
  'RM',
  'LM',
  'GK',
] as const;

export type Role = typeof roles[number];

// export type Role {
//   LW ='LW',
//   RW = 'RW',
//   ST = 'ST',
//   LB ='LB',
//   RB = 'RB',
//   CM = 'CM',
//   CAM = 'CAM',
//   CDM = 'CDM',
//   RM = 'RM',
//   LM = 'LM',
//   GK = 'GK'
// }

export const Roles = {
  ATT: ['LW', 'RW', 'ST'],
  DEF: ['LB', 'RB', 'CB'],
  MID: ['CM', 'CAM', 'CDM', 'RM', 'LM'],
  GK: ['GK'],
};

export class Player {
  [x: string]: any;
  private _model: Model<IPlayer>;

  constructor() {
    const PlayerSchema: Schema = new Schema(
      {
        FirstName: {
          type: String,
          required: true,
        },
        LastName: {
          type: String,
          required: true,
        },
        Nationality: {
          type: Schema.Types.ObjectId,
          ref: 'Place',
          autopopulate: true,
        },
        Age: {
          type: Number,
        },
        PlayerID: String,
        Position: {
          type: String,
          enum: Object.values(Positions),
        },
        Role: {
          type: String,
        },
        PositionNumber: Number,
        Attributes: {
          type: Object,
          PreferredFoot: { type: String },
          Speed: { type: Number, default: 0 },
          Shooting: { type: Number, default: 0 },
          LongPass: { type: Number, default: 0 },
          ShortPass: { type: Number, default: 0 },
          Mental: { type: Number, default: 0 },
          Control: { type: Number, default: 0 },
          Tackling: { type: Number, default: 0 },
          Dribbling: { type: Number, default: 0 },
          Setpiece: { type: Number, default: 0 },
          Strength: { type: Number, default: 0 },
          Stamina: { type: Number, default: 0 },
          Vision: { type: Number, default: 0 },
          ShotPower: { type: Number, default: 0 },
          Aggression: { type: Number, default: 0 },
          Interception: { type: Number, default: 0 },
          Keeping: { type: Number, default: 0 },
          // new 27-08-21
          Marking: { type: Number, default: 0 },
          Agility: { type: Number, default: 0 },
          Positioning: { type: Number, default: 0 },
          Crossing: { type: Number, default: 0 },
          LongShot: { type: Number, default: 0 },
          // new end
          AttackingMindset: { type: Boolean, default: false },
          DefensiveMindset: { type: Boolean, default: false },
        },
        /** overall Player rating over 100 - e.g 88 */
        Rating: Number,
        ShirtNumber: String,
        Value: {
          type: Number,
        },
        Form: { type: Number, default: 6 },
        isReserve: { type: Boolean, default: false },
        Appearance: PlayerAppearanceSchema,
        TransferHistory: [PlayerTransferHistorySchema],
        /** Maybe this should be updated at the end of every season... */
        RatingsHistory: [PlayerRatingsHistory],
        isSigned: {
          type: Boolean,
          default: false,
        },
        ClubCode: {
          type: String,
          default: null,
        },
        Club: { type: Schema.Types.ObjectId, ref: 'Club' },
      },
      { timestamps: true }
    );

    const populate = function (next: any) {
      this.populate('Nationality');
      next();
    };


    PlayerSchema.post('remove', async function(doc, next) {

      await DB.Models.Club.updateOne(
        { Players : this._id},
        { $pull: { Players: this._id } },
        { multi: true })  //if reference exists in multiple documents
        .exec();

        await DB.Models.PlayerMatch.deleteMany({ Player: this._id });

        next();
    });

    PlayerSchema.pre('find', populate).pre('findOne', populate);

    this._model = model<IPlayer>('Player', PlayerSchema, 'Players');
  }

  public get model(): Model<IPlayer> {
    return this._model;
  }
}
