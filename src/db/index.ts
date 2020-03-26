// tslint:disable: variable-name
import { connect, connection, Connection, set } from 'mongoose';
import {
  Competition,
  CompetitionModel,
} from '../controllers/competitions/competition.model';
import { Player, PlayerModel } from '../controllers/players/player.model';
import { Season, SeasonModel } from '../controllers/seasons/season.model';
import { Club, ClubModel } from '../controllers/clubs/club.model';
import { User, UserModel } from '../models/user.model';

declare interface IModels {
  Competition: CompetitionModel;
  Player: PlayerModel;
  Season: SeasonModel;
  Club: ClubModel;
  User: UserModel;
}

const MONGO_DEV_URL = 'mongodb://localhost:27017/fs-pro';

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
    connect(MONGO_DEV_URL, { useNewUrlParser: true })
      .then(client => {
        console.log(
          `Connection to ${client.connection.db.databaseName} database successful!`
        );
      })

      .catch(err => {
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
    };

    set('useFindAndModify', false);
    set('useCreateIndex', true);
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
    console.log('Error in connection to database', error);
  }
}
