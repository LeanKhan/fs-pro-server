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
import { IUserLogin } from '@/interfaces/Response';

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
router.post('/join', async (req, res) => {
  const response = await createNewUser(req.body.data);

  if (!response.error) {
    respond.success(res, 200, 'User created successfully', response.result);
  } else {
    if (response.result.code === 11000) {
      respond.fail(res, 400, 'Username already exists!', response.result);
    } else {
      respond.fail(res, 400, 'Error creating user', response.result);
    }
  }
});

router.post('/login', (req, res) => {
  const { Username, Password }: IUserLogin = req.body.data;

  const response = fetchOneUser({ Username }, true);

  response
    .then((result: any) => {
      if (!result) {
        return respond.fail(res, 404, 'Username does not exist');
      } else {
        // User exists... check password
        result!.comparePassword(Password, (error: any, isMatch: boolean) => {
          if (error) {
            throw error;
          }
          if (isMatch) {
            req.body.u = result;
            return respond.success(
              res,
              200,
              'User logged in successfully',
              result.toObject()
            );
          } else {
            respond.fail(res, 400, 'Password is incorrect!', { errorCode: 1 });
          }
        });
      }
    })
    .catch((error: any) => {
      return respond.fail(res, 400, 'Error logging in', error);
    });
});

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

router.delete('/:id/clubs/:id', (req, res) => {
  const id = req.params.id;
  const club_id = req.params.club_id;

  const data = { $pull: { Clubs: club_id } };

  const response = updateUser(id, data);

  response
    .then((user: any) => {
      respond.success(res, 200, 'User removed Club successfully', user);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error removing Club', err);
    });
});

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
