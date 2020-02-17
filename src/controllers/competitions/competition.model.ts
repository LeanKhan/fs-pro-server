import mongoose, { Schema, Document } from 'mongoose';

export interface ICompetitionModel extends Document {
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
    League: { type: Boolean, default: false },
    Tournament: { type: Boolean, default: false },
    Cup: { type: Boolean, default: false },
    Type: String,
    CompetitionCode: String,
    Country: String,
    Clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    Seasons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Season' }],
  },
  { timestamps: true }
);

export default mongoose.model<ICompetitionModel>(
  'Competition',
  Competition,
  'Competitions'
);
