import { Schema, Document, model, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  comparePassword(password: string, callback: any): void;
}

export interface UserModel extends Model<IUser> {}

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
        Stats: { type: Object, Wins: 0, Losses: 0, Draws: 0 },
        Avatar: {
          type: String,
          default: 'default-avatar.png',
        },
        Clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
        isAdmin: {
          type: Boolean,
          default: false,
        },
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
          console.log('Error while hashing password => ', err);
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

    this._model = model<IUser>('User', UserSchema, 'Users');
  }

  public get model(): Model<IUser> {
    return this._model;
  }
}

// TODO: password not hashing.
