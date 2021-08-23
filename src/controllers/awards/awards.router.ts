import { Router } from 'express';
import { fetchAll } from '.';
import respond from '../../helpers/responseHandler';
import {setupRoutes} from '../../helpers/queries';

const router = Router();

/** FETCH ALL Awards */
router.get('/season/:season_id/', (req, res) => {
  // get all season awards...
   const { populate, recipient } = req.query;

   if(!recipient) {
     // error! Recipient must be supplied! Thank you Jesus!
     return       respond.fail(res, 400, 'Award recipient must be indicated!');

   }

  fetchAll({ Season: req.params.season_id }, recipient, populate)
    .then((awards) => {
      respond.success(res, 200, 'Season Awards fetched successfully', awards);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Season Awards', err);
    });
});

setupRoutes(router, 'Award');

export default router;