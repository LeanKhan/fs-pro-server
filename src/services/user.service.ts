import userModel, { IUser, IUserDocument } from '../models/user.model';

/**
 * fetch one user by Id
 *
 * @param id
 */
export const fetchOneUserById = async (id: string) => {
  try {
    const user = await userModel.findById(id);
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
    const user = await userModel.findOne(query);
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
  const user = new userModel(userData);

  return user
    .save()
    .then(u => ({ error: false, result: u }))
    .catch(err => ({ error: true, result: err }));
};
