// Login, Signup & Logout

import express from 'express';
import { createNewUser } from '../services/user.service';
import respond from '../helpers/responseHandler';
import { checkUserExists, checkPassword } from '../middleware/validateUser';

//
const router = express.Router();

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
    respond.fail(res, 400, 'Error creating user', response.result);
  }
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
