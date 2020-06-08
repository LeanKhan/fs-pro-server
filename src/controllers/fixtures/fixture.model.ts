import { Schema, Document, model, Model } from 'mongoose';
import {
  IMatchDetails,
  IMatchEvent,
  IMatchSideDetails,
} from '../../classes/Match';

export interface Fixture {
  _id: string;
  Title: string;
  FixtureID: string;
  SeasonCode: string;
  LeagueCode: string;
  Season: string;
  Played: boolean;
  MatchDate: string;
  PlayedAt: Date;
  Week: number;
  Home: string;
  Away: string;
  Stadium: string;
  Type: 'league' | 'cup' | 'tournament' | 'friendly';
  Status: string;
  Details: IMatchDetails;
  HomeSideDetails: IMatchSideDetails;
  AwaySideDetails: IMatchSideDetails;
  Events: IMatchEvent[];
}

declare interface IFixture extends Document {
  Title: string;
  FixtureID: string;
  SeasonCode: string;
  LeagueCode: string;
  Season: string;
  Played: boolean;
  MatchDate: string;
  PlayedAt: Date;
  Week: number;
  Home: string;
  Away: string;
  Stadium: string;
  Type: 'league' | 'cup' | 'tournament' | 'friendly';
  Status: string;
  Details: IMatchDetails;
  HomeSideDetails: IMatchSideDetails;
  AwaySideDetails: IMatchSideDetails;
  Events: IMatchEvent[];
}

const MatchEventSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['match', 'shot', 'miss', 'save', 'goal', 'dribble', 'tackle'],
  },
  message: String,
  time: String,
  PlayerID: String,
  Player: { type: Schema.Types.ObjectId, ref: 'Player' },
  data: {},
});

const PlayerMatchStatsSchema: Schema = new Schema({
  Player: { type: Schema.Types.ObjectId, ref: 'Player' },
  Goals: Number,
  Saves: Number,
  YellowCards: Number,
  Fouls: Number,
  RedCards: Number,
  Passes: Number,
  Tackles: Number,
  Assists: Number,
  CleanSheets: Number,
  Points: Number,
  Dribbles: Number,
});

const MatchSideDetailsSchema: Schema = new Schema({
  Score: Number,
  TimesWithBall: Number,
  Possession: Number,
  Goals: Number,
  ShotsOnTarget: Number,
  ShotsOffTarget: Number,
  Fouls: Number,
  YellowCards: Number,
  RedCards: Number,
  Passes: Number,
  PlayerStats: [PlayerMatchStatsSchema],
  Won: { type: Boolean, default: false },
  Drew: { type: Boolean, default: false },
  Events: [MatchEventSchema],
});

// Custom Schemas (Subdocuments)
// ... MatchDetails ...
const MatchDetailsSchema: Schema = new Schema({
  Draw: Boolean,
  FirstHalfScore: String,
  FullTimeScore: String,
  HomeTeamScore: Number,
  AwayTeamScore: Number,
  Winner: String,
  Loser: String,
  MOTM: { type: Schema.Types.ObjectId, ref: 'Player' },
});

export interface FixtureModel extends Model<IFixture> {}

export class Fixture {
  private _model: Model<IFixture>;

  constructor() {
    const FixtureSchema: Schema = new Schema(
      {
        Title: String,
        FixtureCode: String,
        SeasonCode: String,
        LeagueCode: String,
        Week: { type: Number },
        Season: { type: Schema.Types.ObjectId, ref: 'Season' },
        Stadium: String,
        Played: { type: Boolean, default: false },
        Status: {
          type: String,
          default: 'regular',
          enum: ['friendly', 'first-leg', 'second-leg', 'regular'],
        },
        ReverseFixture: { type: Schema.Types.ObjectId, ref: 'Fixture' },
        PlayedAt: Date,
        Home: String,
        Away: String,
        HomeTeam: { type: Schema.Types.ObjectId, ref: 'Club' },
        AwayTeam: { type: Schema.Types.ObjectId, ref: 'Club' },
        Details: MatchDetailsSchema,
        Events: [MatchEventSchema],
        Type: {
          type: String,
        },
        HomeSideDetails: MatchSideDetailsSchema,
        AwaySideDetails: MatchSideDetailsSchema,
      },
      { timestamps: true }
    );

    this._model = model<IFixture>('Fixture', FixtureSchema, 'Fixtures');
  }

  public get model() {
    return this._model;
  }
}
