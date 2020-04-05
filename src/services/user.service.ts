import DB from '../db';

/**
 * fetch one user by Id
 *
 * @param id
 */
export const fetchOneUserById = async (id: string) => {
  try {
    const user = await DB.Models.User.findById(id);
    return { error: false, result: user };
  } catch (err) {
    return { error: true, result: err };
  }
};

/**
 * fetch a user by a query
 * @param query
 */
export const fetchOneUser = async (query: {}) => {
  try {
    const user = await DB.Models.User.findOne(query);
    return { error: false, result: user };
  } catch (err) {
    return { error: true, result: err };
  }
};

/**
 * Create New User
 *
 * @param userData
 */
export const createNewUser = async (userData: any) => {
  const USER = new DB.Models.User(userData);

  return USER.save()
    .then(user => ({ error: false, result: user }))
    .catch(err => ({ error: true, result: err }));
};
