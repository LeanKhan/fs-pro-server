import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById } from './fixture.service';

const router = Router();

/** Get Fixture by id */
router.get('/:id', (req, res) => {
  const response = fetchOneById(req.params.id, false);

  response
    .then((fixture) => {
      respond.success(res, 200, 'Fixture fetched successfully', fixture);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Fixture', err);
    });
});
