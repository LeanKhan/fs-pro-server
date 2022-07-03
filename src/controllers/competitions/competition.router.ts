import { Router, Request, Response } from 'express';
import {
  fetchAll,
  fetchOneById,
  createNew,
  update,
  deleteByRemove,
} from './competition.service';
import { fetchAll as fetchAllSeasons } from '../seasons/season.service';
import respond from '../../helpers/responseHandler';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';
import { addClubToCompetition } from './competition.controller';
import { setupRoutes } from '../../helpers/queries';

const router = Router();

/** Get all Competitions */
router.get('/all', (req: Request, res: Response) => {

  let {query, select} = req.query;

  if(query){
    try {
      query = JSON.parse(query);
    } catch (err) {
    // can't parse JSON
    query = '';
    }
  }

  fetchAll(query, select)
    .then((competitions) => {
      return respond.success(
        res,
        200,
        'Competitions fetched successfully',
        competitions
      );
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Error fetching Competitions', err);
    });
});

/** Get Competition by id */
router.get('/:id', (req: Request, res: Response) => {
  const { populate } = req.query;
  const response = fetchOneById(req.params.id, populate != 'false');

  response
    .then((competition) => {
      respond.success(
        res,
        200,
        'Competition fetched successfully',
        competition
      );
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Competition', err);
    });
});

/** Get all the seasons */
router.get('/:id/seasons/all', (req: Request, res: Response) => {
  const response = fetchAllSeasons({ Competition: req.params.id });

  response
    .then((seasons) => {
      respond.success(
        res,
        200,
        'Seasons in competition fetched successfully',
        seasons
      );
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching seasons in competition', err);
    });
});

/** Update Competition by id */
router.post('/:id/update', (req: Request, res: Response) => {
  const response = update(req.params.id, req.body.data);

  response
    .then((competition) => {
      respond.success(
        res,
        200,
        'Competition updated successfully',
        competition
      );
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error in updating Competition', err);
    });
});

/** Delete Competition by id */
router.delete('/:id', (req: Request, res: Response) => {
  deleteByRemove(req.params.id)
    .then((data) => {
      respond.success(res, 200, 'Competition deleted successfully', data);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Competition', err);
    });
});

/** Create new Competition */
router.post('/new', getCurrentCounter, async (req: Request, res: Response) => {
  const response = await createNew(req.body.data);

  if (!response.error) {
    respond.success(
      res,
      200,
      'Competition created successfully',
      response.result
    );
    void incrementCounter('competition_counter');
  } else {
    respond.fail(res, 400, 'Error creating competition', response.result);
  }
});

/** Add Club to Competition */
router.post('/:id/add-club', addClubToCompetition);

setupRoutes(router, 'Competition');

export default router;
