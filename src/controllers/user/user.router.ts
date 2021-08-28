/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Login, Signup & Logout

import { Router } from 'express';
import {
  createNewUser,
  updateUser,
  fetchUser,
  fetchOneUser,
} from './user.service';
import respond from '../../helpers/responseHandler';
import { checkUserExists, checkPassword } from '../../middleware/validateUser';
import { IUserLogin } from '../../interfaces/Response';
import { initializeSession, findSession } from '../../middleware/user';
import { updateClubs } from '../../controllers/clubs/club.controller';
import { IUser } from './user.model';
import { store } from '../../server';
import log from '../../helpers/logger';

//
const router = Router();

//

/**
 * The minimum data needed is:
 *
 * {
 *  data: {
 *    FirstName: string,
 *    LastName: string,
 *    Username: string,
 *    Password: string
 *   }
 * }
 *
 */
router.post(
  '/join',
  async (req, res, next) => {
    const response = await createNewUser(req.body.data);

    if (!response.error) {
      req.body.userID = response.result._doc._id;
      req.body.clubs = response.result._doc.Clubs;

      next();

      // respond.success(res, 200, 'User created successfully', response.result);
    } else {
      if (response.result.code === 11000) {
        respond.fail(res, 400, 'Username already exists!', response.result);
      } else {
        respond.fail(res, 400, 'Error creating user', response.result);
      }
    }
  },
  updateClubs,
  initializeSession
);

/** Login User */
router.post(
  '/login',
  (req, res, next) => {
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
              req.body.userID = result.toObject()._id;
              // return respond.success(
              //   res,
              //   200,
              //   'User logged in successfully',
              //   result.toObject()
              // );
              next();
            } else {
              respond.fail(res, 400, 'Password is incorrect!', {
                errorCode: 1,
              });
            }
          });
        }
      })
      .catch((error: any) => {
        return respond.fail(res, 400, 'Error logging in', error);
      });
  },
  initializeSession
);

/** Change User's password */
router.post('/change-password', (req, res, next) => {
  const { Username, NewPassword } = req.body;

  const response = fetchOneUser({ Username }, true);

  response.then((result: IUser) => {
    if (!result) {
      return respond.fail(res, 404, 'Username does not exist');
    } else {
      // User exists... check password

      result.Password = NewPassword;

      result
        .save()
        .then((user) => {
          return respond.success(
            res,
            200,
            'Password changed successfully',
            user.toObject()
          );
        })
        .catch((error) => {
          return respond.fail(res, 400, 'Error changing password', error);
        });
    }
  });
  initializeSession;
});

/** Get User by id */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const populate = req.query.populate || false;

  const response = fetchUser(id, populate);

  response
    .then((user: any) => {
      respond.success(res, 200, 'User fetched successfully', user);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching User', err);
    });
});

/** Logout User */
router.delete('/:id/logout', (req, res) => {
  // delete user's session
  const userID = req.params.id;
  console.log(`User ID => ${userID}`);
  
  fetchOneUser({ _id: userID }, true)
    .then((user: IUser) => {
      if (!user) {
        return respond.fail(res, 404, 'Username does not exist');
      } else {
        // User exists... check password
        user.findSession(
          user.Session,
          function (err: any, sess: Express.SessionData) {
            if (sess) {
              // If you find the session it means it's an old one so do this...
              // set a new one, create a new cookie and send session data to client
              store.destroy(user.Session, (err: any) => {
                if (err) {
                  throw new Error('Error in destroying Session');
                } else {
                  return respond.success(
                    res,
                    200,
                    'Client logged out successfully'
                  );
                }
              });
            } else {
                  throw new Error('Session not found! Try reloading');
            }
          }
        );
      }
    })
    .catch((error: any) => {
      return respond.fail(res, 400, 'Error logging out', error);
    });
});

/** Update User by id */
router.post('/:id/update', (req, res) => {
  const id = req.params.id;
  const { data } = req.body;

  const response = updateUser(id, data);

  response
    .then((user: any) => {
      respond.success(res, 200, 'User updated successfully', user);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error updating User', err);
    });
});

/** Add Clubs to User account */
router.post('/:id/add-clubs', (req, res) => {
  const id = req.params.id;
  const { data } = req.body;

  const clubs = { Clubs: data };

  const response = updateUser(id, clubs);

  response
    .then((user: any) => {
      respond.success(res, 200, 'Clubs added successfully', user);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error adding Clubs', err);
    });
});

/** Add Club to User account */
router.post('/:id/add-club', (req, res) => {
  const id = req.params.id;
  const { clubId } = req.body.data;

  const data = { $push: { Clubs: clubId } };

  const response = updateUser(id, data);

  response
    .then((user: any) => {
      respond.success(res, 200, 'Club added successfully', user);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error adding Club', err);
    });
});

/** Remove Club from User account */
router.delete('/:id/clubs/:id', (req, res) => {
  const id = req.params.id;
  const club_id = req.params.club_id;

  const data = { $pull: { Clubs: club_id } };

  updateUser(id, data)
    .then((user: any) => {
      respond.success(res, 200, 'User removed Club successfully', user);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error removing Club', err);
    });
});

/** Enter.. ??? [Need clarification] */
router.post('/enter', findSession);

//

/**
 * Format to send login data
 *
 * {
 *  data: {
 *    Username: string,
 *    Password: string
 *   }
 * }
 *
 */
router.post('/login', checkUserExists, checkPassword);

export default router;
