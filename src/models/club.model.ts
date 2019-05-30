import mongoose, { Schema, Document } from 'mongoose';
// import {Team} from '../classes/Team';
// import { Player } from '../models/player.model'; // Uncomment this after testing!

export interface Club extends Document {
  Name: string;
  AttackingClass: number;
  DefensiveClass: number;
  Players: [];
  Manager: string;
  Stadium: string;
  LeagueCode: string;
}

const ClubSchema: Schema = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    ClubCode: {
      type: String,
      required: true,
    },
    AttackingClass: {
      type: Number,
      required: true,
    },
    DefensiveClass: {
      type: Number,
      required: true,
    },
    Manager: String,
    Stadium: String,
    LeagueCode: String,
    Players: {
      type: Array,
    },
  },
  { timestamps: true }
);

export default mongoose.model<Club>('Club', ClubSchema, 'Clubs');

/*
 * Change the type od 'Players' to ObjectID of Players collection
 *
 */
