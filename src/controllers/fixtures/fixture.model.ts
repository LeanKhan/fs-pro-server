import { Schema, Document, model, Model } from 'mongoose';
import DB from '../../db';
import {
  IMatchDetails,
  IMatchEvent,
  IMatchSideDetails,
} from '../../classes/Match';
import { ClubInterface } from '../clubs/club.model';

export interface Fixture {
  _id: string;
  Title: string;
  FixtureID: string;
  SeasonCode: string;
  LeagueCode: string;
  Season: string;
  Played: boolean;
  PlayedAt: Date;
  Week: number;
  Home: string;
  Away: string;
  HomeTeam: string | ClubInterface;
  AwayTeam: string | ClubInterface;
  Stadium: string;
  Type: 'league' | 'cup' | 'tournament' | 'friendly';
  Status: 'friendly' | 'first-leg' | 'second-leg' | 'regular';
  Tie: string;
  Stage: string;
  ReverseFixture: string;
  Details: IMatchDetails;
  HomeSideDetails: IMatchSideDetails;
  AwaySideDetails: IMatchSideDetails;
  Events: IMatchEvent[];
  HomeManager: string;
  AwayManager: string;
  isFinalMatch: boolean;
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
  HomeTeam: string | ClubInterface;
  AwayTeam: string | ClubInterface;
  Stadium: string;
  Type: 'league' | 'cup' | 'tournament' | 'friendly';
  Status: 'friendly' | 'first-leg' | 'second-leg' | 'regular';
  ReverseFixture: { type: Schema.Types.ObjectId; ref: 'Fixture' };
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
  playerID: String,
  playerTeamID: String,
  data: {},
});

// Custom Schemas (Subdocuments)
// ... MatchDetails ...
const MatchDetailsSchema: Schema = new Schema({
  Draw: Boolean,
  FirstHalfScore: String,
  FullTimeScore: String,
  HomeTeamScore: Number,
  AwayTeamScore: Number,
  Winner: { type: Schema.Types.ObjectId, ref: 'Club' },
  Loser: { type: Schema.Types.ObjectId, ref: 'Club' },
  MOTM: { type: Schema.Types.ObjectId, ref: 'Player' },
});

export type FixtureModel = Model<IFixture>;

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
        Tie: {
          type: String,
          enum: ['first-leg', 'second-leg', 'friendly'],
        },
        Stage: {
          type: String,
          default: 'lg-match',
          enum: ['qt-final', 'sm-final', 'final', 'lg-match', 'gp-stage'],
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
        HomeSideDetails: {
          type: Schema.Types.ObjectId,
          ref: 'ClubMatchDetails',
        },
        AwaySideDetails: {
          type: Schema.Types.ObjectId,
          ref: 'ClubMatchDetails',
        },
        HomeManager: { type: Schema.Types.ObjectId, ref: 'Manager' },
        AwayManager: { type: Schema.Types.ObjectId, ref: 'Manager' },
        isFinalMatch: {
          type: Boolean,
          default: false,
        },
      },
      { timestamps: true }
    );

    FixtureSchema.post('remove', async function(next) {
      await DB.Models.Season.updateOne(
          { Fixtures : this._id},
          { $pull: { Fixtures: this._id } },
          { multi: true })  //if reference exists in multiple documents
      .exec();

      next();
  });

    this._model = model<IFixture>('Fixture', FixtureSchema, 'Fixtures');
  }

  public get model() {
    return this._model;
  }
}
