import DB from '../../db';
import log from '../../helpers/logger';

/**
 * fetch one user by Id
 *
 * @param id,
 * @param populate default false
 */
export function fetchUser(id: string, populate = false) {
  if (populate) {
    return DB.Models.User.findById(id).populate('Clubs').lean().exec();
  } else {
    return DB.Models.User.findById(id).lean().exec();
  }
}

/** fetch User session */
export function getUserSession(id: string, session: string) {
  return DB.Models.User.findById(id).then((user) => {
    user!.findSession(session, (a: any, sess: any) => {
      if (sess) {
        log('Session =>', sess);
        return sess;
      }
    });
  });
}

/**
 * fetch a user by a query
 * @param query
 */
export function fetchOneUser(
  query: Record<string, unknown>,
  doc = false,
  populate = false
) {
  if (doc && !populate) {
    return DB.Models.User.findOne(query).exec();
  }

  if (populate) {
    return DB.Models.User.findOne(query).populate('Clubs').lean().exec();
  }

  return DB.Models.User.findOne(query).populate('Clubs').lean().exec();
}

// export function findUserAndComparePassword(query: {}) {
//   // tslint:disable-next-line: only-arrow-functions
//   return DB.Models.User.findOne(query).exec();
// }

/**
 *
 * @param userData
 */

export function updateUser(id: string, data: any) {
  return DB.Models.User.findByIdAndUpdate(id, data, { new: true });
}

export function updateManyUsers(query: any, update: any) {
  return DB.Models.User.updateMany(query, update, { multi: true });
}

/**
 * Create New User
 *
 * @param userData
 */
export const createNewUser = async (userData: any) => {
  const USER = new DB.Models.User(userData);

  return USER.save()
    .then((user) => ({ error: false, result: user }))
    .catch((err) => ({ error: true, result: err }));
};


export function addClubsToUser(id: string, clubs: string[]) {
  return DB.Models.User.updateOne(
    { _id: id },
    { $addToSet: { Clubs: {$each: clubs} } },
    { multi: true }
  ).lean();
}