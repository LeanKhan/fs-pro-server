import { Request, Response, NextFunction } from 'express';
import { fetchOneUser } from '../services/user.service';
import { IUserLogin } from '../interfaces/Response';
import respond from '../helpers/responseHandler';
import { IUser } from '../models/user.model';

/**
 * Check if user actually exists fam :)
 * @param req
 * @param res
 * @param next
 */
export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { Username }: IUserLogin = req.body.data;

  const response = await fetchOneUser({ Username });

  if (response.error) {
    return respond.fail(res, 400, 'Error logging in', response.result);
  } else if (!response.result) {
    return respond.fail(res, 404, 'Username does not exist');
  } else {
    req.body.u = response.result;
    return next();
  }
};

/**
 * Check if password is correct fam :)
 * @param req
 * @param res
 */
export const checkPassword = async (req: Request, res: Response) => {
  const { Password }: IUserLogin = req.body.data;
  const u: IUser = req.body.u;

  u.comparePasswords(Password, (err: any, isMatch: boolean) => {
    if (!isMatch || err) {
      return respond.fail(res, 400, 'Password is incorrect');
    }
    return respond.success(res, 200, 'User login successful');
  });
};
