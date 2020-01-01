import mongoose, { Schema, Document } from 'mongoose';
import { IPlayerAttributes } from '../interfaces/Player';

export interface IPlayerModel extends Document {
  /** Name of the Player! */
  FirstName: string;
  LastName: string;
  Age: string;
  Player_ID: string;
  /** overall Player rating */
  Rating: number;
  /** Goals scored in total */
  GoalsScored: number;
  ShirtNumber: string;
  /** Collecting of Player's attributes */
  Attributes: IPlayerAttributes;
  /** Monetary value of Player */
  Value: number;
  /** Some Players don't have clubs (free agents) hence can be undefined */
  ClubCode?: string;
}

const Player: Schema = new Schema(
  {
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
    },
    Player_ID: String,
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
      Catching: Number,
      AttackingMindset: Boolean,
      DefensiveMindset: Boolean,
    },
    /** overall Player rating over 100 - e.g 88 */
    Rating: Number,
    GoalsScored: Number,
    ShirtNumber: String,
    Value: {
      type: Number,
      default: 0,
    },
    isSigned: {
      type: Boolean,
      default: false
    },
    ClubCode: String,
  },
  { timestamps: true }
);

export default mongoose.model<IPlayerModel>('Player', Player, 'Players');
