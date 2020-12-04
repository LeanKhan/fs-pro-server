import { Request, Response, NextFunction, RequestHandler } from 'express';
import { updateUser, fetchOneUser } from '../controllers/user/user.service';
import responseHandler from '../helpers/responseHandler';
import { store } from '../server';
import { IUser } from '../controllers/user/user.model';
import log from '../helpers/logger';

export function initializeSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.body.userID;
  req.session!.userID = id;

  req.session!.save((err: any) => {
    if (err) {
      responseHandler.fail(res, 400, 'Error creating session', err);
    } else {
      // User has been crreated

      const response = updateUser(id, { Session: req.sessionID }).lean();

      response
        .then((user: any) => {
          responseHandler.success(res, 200, 'User authenticated successfully', {
            ...user,
          });
        })
        .catch((error) => {
          responseHandler.fail(res, 400, 'Error fetching User', error);
        });
    }
  });
}

/**
 * checkSession
 *
 * Check if session exists...
 *
 * @param req
 * @param res
 * @param next
 */
export const checkSession: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session!.socketID) {
    const sessionID = req.sessionID as string;

    store.get(sessionID, (err: any, session: any) => {
      if (session) {
        return responseHandler.success(res, 200, 'Authenticated successfully', {
          sessionExists: true,
          user: { userID: req.session!.userID, sessionID },
        });
      } else {
        //  if session is expired or something, go to the next middleware...
        //  the next one checks if the client sent any session object

        return next();
      }
    });
  } else {
    //   If the request does not have any session object attached move to next middleware...
    return next();
  }
};

export function findSession(req: Request, res: Response, next: NextFunction) {
  const { userID, sessionID } = req.body.user;

  // This is if the cookie was not sent back, if not find the session and create a new one with the same data...

  fetchOneUser({ _id: userID }, true, false)
    .then((user: IUser) => {
      // here find an accompanying session...
      user.findSession(
        user.Session,
        function (err: any, sess: Express.SessionData) {
          if (sess) {
            // If you find the session it means it's an old one so do this...
            // set a new one, create a new cookie and send session data to client
            store.set(sessionID, sess, (err: any) => {
              if (err) {
                throw new Error('Error in setting Session' + `${err}`);
              } else {
                // store.createSession(req, sess);

                user.Session = req.sessionID as string;

                // Maybe here delete that old session?...

                void user.save();

                return responseHandler.success(
                  res,
                  200,
                  'Client Authenticated successfully',
                  { userID: user._id, sessionID: req.sessionID }
                );
              }
            });
          } else {
            // User exists but does not have any associated sessions...
            req.session!.userID = user._id;

            req.session!.save((err: any) => {
              if (err) {
                throw new Error('Error in saving new user session' + `${err}`);
              } else {
                user.Session = req.sessionID as string;
                void user.save();

                return responseHandler.success(
                  res,
                  200,
                  'Client Authenticated successfully',
                  { userID: user._id, sessionID: req.sessionID }
                );
              }
            });
          }
        }
      );
    })
    .catch((err) => {
      log(`error in entering => ${err}`);
      responseHandler.fail(res, 400, 'Error in authentication', err);
    });
}
