import mongoose, { Schema, Document } from 'mongoose';
// import { Player } from '../models/player.model'; // Uncomment this after testing!

export interface IClubModel extends Document {
  Name: string;
  AttackingClass: number;
  DefensiveClass: number;
  Players: [];
  PlayingStyle: 'attacking' | 'defensive' | 'balanced';
  assets: {
      Kit: string,
      Logo: string,
      Stadium: string
    };
  Manager: string;
  Stadium: string;
  LeagueCode: string;
  League: string;
}

const ClubSchema: Schema = new Schema(
  {
    Name: {
      type: String,
      required: true,
      unique: true
    },
    ClubCode: {
      type: String,
      required: true,
      unique: true
    },
    AttackingClass: {
      type: Number,
    },
    DefensiveClass: {
      type: Number,
    },
    PlayingStyle: {
      type: String,
      required: true
    },
    Manager: {
      type: String,
      unique: true
    },
    assets: {
      type: Object,
      Kit: String,
      Logo: String,
      Stadium: String
    },
    Stadium: {
      type: String,
      unique: true
    },
    LeagueCode: String,
    League: {type: mongoose.Schema.Types.ObjectId, ref: 'League'},
    Players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player'}]
  },
  { timestamps: true }
);


/*
 * ClubModel in Database o!
 *
 */
export default mongoose.model<IClubModel>('Club', ClubSchema, 'Clubs');

