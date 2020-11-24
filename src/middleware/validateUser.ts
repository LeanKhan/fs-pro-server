import { Request, Response, NextFunction } from 'express';
import { fetchOneUser } from '../controllers/user/user.service';
import { IUserLogin } from '../interfaces/Response';
import respond from '../helpers/responseHandler';
import { IUser } from '../controllers/user/user.model';

/**
 * Check if user actually exists fam :)
 * @param req
 * @param res
 * @param next
 */
export const checkUserExists = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { Username, Password }: IUserLogin = req.body.data;

  const response = fetchOneUser({ Username }, true);

  response
    .then((result: any) => {
      if (!result) {
        return respond.fail(res, 404, 'Username does not exist');
      } else {
        // User exists... check password
        result.comparePassword(Password, (error: any, isMatch: boolean) => {
          if (error) {
            throw error;
          }
          if (isMatch) {
            req.body.u = result;
            return next();
          }
        });
      }
    })
    .catch((error: any) => {
      return respond.fail(res, 400, 'Error logging in', error);
    });
};

/**
 * Check if password is correct fam :)
 * @param req
 * @param res
 */
export const checkPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { Password }: IUserLogin = req.body.data;
  const u: IUser = req.body.u;

  u.comparePassword(Password, (err: any, isMatch: boolean) => {
    if (!isMatch || err) {
      return respond.fail(res, 400, 'Password is incorrect');
    }

    return next();
    // return respond.success(res, 200, 'User login successful');
  });
};
