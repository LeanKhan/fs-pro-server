import mongoose, { Schema, Document } from 'mongoose';
import { MatchSide } from '../classes/MatchSide';
import { IMatchDetails, IMatchEvent } from '../classes/Match';

interface MatchModel extends Document {
  Home: MatchSide;
  Away: MatchSide;
  Stadium: string;
  Details: IMatchDetails;
  Events: IMatchEvent[];
  MOTM: string;
  Fulltime: string;
  Played: boolean;
}

const MatchSchema: Schema = new Schema(
  {
    Home: String,
    Away: String,
    Stadium: String,
    SeasonCode: String,
    CompetitionCode: String,
    LeagueString: String,
    MatchTitle: String,
    MatchDescription: String,
    LeagueCode: String,
    Details: {
      type: Object,
      HomeTeamScore: Number,
      AwayTeamScore: Number,
      TotalPasses: Number,
      FirstHalfScore: String,
      FullTimeScore: String,
      Winner: String,
      Loser: String,
      HomeTeamDetails: {
        ClubCode: String,
        Possession: { type: Number, default: 0 },
        Goals: { type: Number, default: 0 },
        TotalShots: { type: Number, default: 0 },
        ShotsOnTarget: { type: Number, default: 0 },
        ShotsOffTarget: { type: Number, default: 0 },
        Passes: { type: Number, default: 0 },
        SquadStats: [],
      },
      AwayTeamDetails: {
        ClubCode: String,
        Possession: { type: Number, default: 0 },
        TimesWithBall: { type: Number, default: 0 },
        Goals: { type: Number, default: 0 },
        TotalShots: { type: Number, default: 0 },
        ShotsOnTarget: { type: Number, default: 0 },
        ShotsOffTarget: { type: Number, default: 0 },
        Passes: { type: Number, default: 0 },
        SquadStats: [],
      },
    },
    Events: {
      type: Array,
    },
    MOTM: String,
    Fulltime: String,
    Played: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<MatchModel>('Fixture', MatchSchema, 'Fixtures');
