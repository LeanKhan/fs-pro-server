import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById } from './fixture.service';

const router = Router();

router.get('/:id', (req, res) => {
  const response = fetchOneById(req.params.id);

  response
    .then((fixture) => {
      respond.success(res, 200, 'Fixtured fetched successfully', fixture);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Fixture', err);
    });
});
