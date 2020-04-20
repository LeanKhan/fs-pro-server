import DB from '../../db';

/**
 * fetch one user by Id
 *
 * @param id
 */
export function fetchUser(id: string, populate = false) {
  if (populate) {
    return DB.Models.User.findById(id).populate('Clubs').lean().exec();
  } else {
    return DB.Models.User.findById(id).lean().exec();
  }
}

/**
 * fetch a user by a query
 * @param query
 */
export function fetchOneUser(query: {}, doc = false) {
  if (doc) {
    return DB.Models.User.findOne(query).exec();
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
