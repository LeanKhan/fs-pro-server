import mongoose, { Schema, Document } from 'mongoose';

export interface CompetitionModel extends Document {
  Type: string;
  Title: string;
  League: boolean;
  Tournament: boolean;
  Clubs: [];
  Seasons: [];
}

const Competition: Schema = new Schema(
  {
    Name: String,
    League: Boolean,
    Tournament: Boolean,
    Cup: Boolean,
    CompCode: String,
    Country: String,
    Clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    Seasons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Season' }],
  },
  { timestamps: true }
);

export default mongoose.model<CompetitionModel>(
  'Competition',
  Competition,
  'Competitions'
);
