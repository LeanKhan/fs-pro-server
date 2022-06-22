import { Schema, Document, model, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { store } from '../../server';
import log from '../../helpers/logger';
export declare interface IUser extends Document {
  FirstName: string;
  LastName: string;
  Email: string;
  Age: string;
  Username: string;
  Avatar: string;
  Password: string;
  Clubs: [];
  isAdmin: boolean;
  /** The Session ID associated with this user */
  Session: string;
  comparePassword(password: string, callback: any): void;
  findSession(session: string, callback: any): void;
}

export type UserModel = Model<IUser>;

export class User {
  private _model: Model<IUser>;

  constructor() {
    const UserSchema: Schema = new Schema(
      {
        FullName: {
          type: String,
          required: true,
        },
        Email: {
          type: String,
          unique: true,
        },
        Password: {
          type: String,
          required: true,
        },
        Age: Number,
        Username: {
          type: String,
          required: true,
          unique: true,
          minlength: 3,
        },
        Avatar: {
          type: String,
          default: 'default-avatar.png',
        },
        Alerts: {
          type: Object
        },
        Clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
        isAdmin: {
          type: Boolean,
          default: false,
        },
        Session: String,
      },
      { timestamps: true }
    );

    UserSchema.pre('save', function (this: IUser, next) {
      if (!this.isModified('Password')) {
        return next();
      }

      bcrypt
        .hash(this.Password, 10)
        .then((hash) => {
          this.Password = hash;
          next();
        })
        .catch((err) => {
          log(`Error while hashing password => ${err}`);
        });
    });

    // compare passwords function
    UserSchema.methods.comparePassword = function (password: string, cb: any) {
      bcrypt.compare(password, this.Password, (err, isMatch) => {
        if (err) {
          return cb(err);
        }

        cb(null, isMatch);
      });
    };

    // tslint:disable-next-line: only-arrow-functions
    UserSchema.methods.findSession = function (sessionID: string, cb: any) {
      store.get(sessionID, (err, sess) => {
        // if the session found is the same one the user has
        if (!err && this.Session === sessionID) {
          return cb(null, sess);
        } else if (this.Session != sessionID) {
          // Return current session
          return cb(null, this.Session);
        } else {
          throw err;
        }
      });
    };

    this._model = model<IUser>('User', UserSchema, 'Users');
  }

  public get model(): Model<IUser> {
    return this._model;
  }
}
