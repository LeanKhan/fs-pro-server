import mongoose, { Model, Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  FirstName: string;
  LastName: string;
  Email: string;
  Age: string;
  Username: string;
  Avatar: string;
  Password: string;
  Clubs: [];
  isAdmin: boolean;
}

export interface IUser extends IUserDocument {
  comparePasswords(password: string, callback: any): void;
}

export interface IUserModel extends Model<IUser> {}

const UserSchema: Schema = new Schema(
  {
    FirstName: {
      type: String,
      required: true,
    },
    LastName: {
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
      index: { unique: true },
    },
    Avatar: {
      type: String,
      default: 'default-avatar.png',
    },
    Clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// pre-save hook
UserSchema.pre('save', function(this: IUser, next) {
  if (!this.isModified('Password')) {
    return next();
  }

  bcrypt
    .hash(this.Password, 10)
    .then(hash => {
      this.Password = hash;
      next();
    })
    .catch(err => {
      console.log('Error while hashing password => ', err);
    });
});

// compare passwords function
UserSchema.methods.comparePasswords = function(password: string, cb: any) {
  bcrypt.compare(password, this.Password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

const userModel: IUserModel = mongoose.model<IUser, IUserModel>(
  'User',
  UserSchema,
  'Users'
);

export default userModel;

// TODO: password not hashing.

// UserSchema.methods.comparePassword = function(plaintext: string, callback: any){
//     return callback(null, bcrypt.compareSync(plaintext, ))
// }