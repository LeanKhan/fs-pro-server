import { Schema, Document, model, Model } from 'mongoose';
import { IPlayerAttributes, IPlayerStats } from '../../interfaces/Player';

declare interface IPlayer extends Document {
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
  Attributes: IPlayerAttributes;
  Stats: IPlayerStats;
  isSigned: boolean;
  /** Monetary value of Player */
  Value: number;
  /** Some Players don't have clubs (free agents) hence can be undefined */
  ClubCode?: string;
}

export interface PlayerModel extends Model<IPlayer> {}

export class Player {
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
        Nationality: String,
        Age: {
          type: Number,
        },
        PlayerID: String,
        /** Default position */
        Position: {
          type: String,
        },
        PositionNumber: Number,
        Attributes: {
          type: Object,
          Speed: Number,
          Shooting: Number,
          LongPass: Number,
          ShortPass: Number,
          Mental: Number,
          Control: Number,
          Tackling: Number,
          Strength: Number,
          Stamina: Number,
          PreferredFoot: String,
          Keeping: Number,
          AttackingMindset: Boolean,
          DefensiveMindset: Boolean,
        },
        /** overall Player rating over 100 - e.g 88 */
        Rating: Number,
        Stats: {
          type: Object,
          Goals: { type: Number, default: 0 },
          Saves: { type: Number, default: 0 },
          YellowCards: { type: Number, default: 0 },
          RedCards: { type: Number, default: 0 },
          Assists: { type: Number, default: 0 },
          CleanSheets: { type: Number, default: 0 },
          MOTM: { type: Number, default: 0 },
        },
        GoalsScored: Number,
        ShirtNumber: String,
        Value: {
          type: Number,
        },
        isSigned: {
          type: Boolean,
          default: false,
        },
        ClubCode: {
          type: String,
          default: null,
        },
      },
      { timestamps: true }
    );

    this._model = model<IPlayer>('Player', PlayerSchema, 'Players');
  }

  public get model(): Model<IPlayer> {
    return this._model;
  }
}
