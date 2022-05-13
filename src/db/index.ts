/* eslint-disable @typescript-eslint/unbound-method */
// tslint:disable: variable-name
import { connect, connection, Connection, set } from 'mongoose';
import {
  Competition,
  CompetitionModel,
} from '../controllers/competitions/competition.model';
import { Player, PlayerModel } from '../controllers/players/player.model';
import { Season, SeasonModel } from '../controllers/seasons/season.model';
import { Club, ClubModel } from '../controllers/clubs/club.model';
import { User, UserModel } from '../controllers/user/user.model';
import { Fixture, FixtureModel } from '../controllers/fixtures/fixture.model';
import {
  Calendar,
  CalendarModel,
} from '../controllers/calendar/calendar.model';
import { Day, DayModel } from '../controllers/days/day.model';
import { Manager, ManagerModel } from '../controllers/managers/manager.model';
import {
  ClubMatchDetails,
  ClubMatchDetailsModel,
} from '../controllers/club-match/club-match.model';
import {
  PlayerMatchDetails,
  PlayerMatchDetailsModel,
} from '../controllers/player-match/player-match.model';
import { Place, PlaceModel } from '../controllers/places/places.model';
import { Award, AwardModel } from '../controllers/awards/awards.model';
import log from '../helpers/logger';
import {Model} from 'mongoose';

declare interface IModels {
  Competition: CompetitionModel;
  Player: PlayerModel;
  Season: SeasonModel;
  Club: ClubModel;
  User: UserModel;
  Fixture: FixtureModel;
  Calendar: CalendarModel;
  Day: DayModel;
  Manager: ManagerModel;
  ClubMatch: ClubMatchDetailsModel;
  PlayerMatch: PlayerMatchDetailsModel;
  Place: PlaceModel;
  Award: AwardModel;
  [key: string]: Model<any>;
}

// Production! Well, sha for Tobi and I. Thank you Jesus!
let prod_db = '';
if (process.env.DEV_TEST?.trim()) {
  prod_db = process.env.DEV_MONGO_URL?.trim() as string;
} else {
  prod_db = process.env.PROD_MONGO_URL?.trim() as string;
}

export const MONGO_URL = prod_db;

export default class DB {
  public static start() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
  }

  private static instance: DB;

  private _db: Connection;
  private _models: IModels;

  private constructor() {
    connect(MONGO_URL, { useNewUrlParser: true })
      .then((client) => {
        console.log(
          `Connection to ${client.connection.db.databaseName} database successful!`
        );
      })

      .catch((err) => {
        console.error(`Error in connecting to database: `, err);
      });
    this._db = connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);

    this._models = {
      Competition: new Competition().model,
      Player: new Player().model,
      Season: new Season().model,
      Club: new Club().model,
      User: new User().model,
      Fixture: new Fixture().model,
      Calendar: new Calendar().model,
      Day: new Day().model,
      Manager: new Manager().model,
      ClubMatch: new ClubMatchDetails().model,
      PlayerMatch: new PlayerMatchDetails().model,
      Place: new Place().model,
      Award: new Award().model,
    };

    // TODO: remove this later
    set('strictQuery', false);
    set('strict', false);
  }

  public static get Models() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance._models;
  }

  public static get db() {
    return connection.db;
  }

  private connected() {
    console.log('Mongoose has connected');
  }

  private error(error: any) {
    console.log(`Error in connection to database => ${error}`);
  }
}
