import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from '../../interfaces/Player';
// import { Player } from '../models/player.model'; // Uncomment this after testing!

export interface IClubModel extends Document {
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
  Address: {};
  Manager: string;
  Stadium: {};
  Stats: {};
  LeagueCode: string;
  League: string;
}

// TODO:
// Figure out how to calculate Club rating o!

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
    Rating: Number,
    Manager: {
      type: String,
      unique: true,
    },
    assets: {
      type: Object,
      Kit: String,
      Logo: String,
      Stadium: String,
    },
    Stats: {
      type: Object,
      LeagueTitles: Number,
      Cups: Number,
    },
    Address: {
      type: Object,
      Section: String,
      City: String,
      Country: String,
    },
    Stadium: {
      type: Object,
      Name: String,
      Capacity: String,
      YearOccupied: String,
      Location: String,
      unique: true,
    },
    LeagueCode: String,
    League: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    Players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  },
  { timestamps: true }
);

/*
 * ClubModel in Database o!
 *
 */
export default mongoose.model<IClubModel>('Club', ClubSchema, 'Clubs');
