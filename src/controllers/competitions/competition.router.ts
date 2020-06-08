import { Router, Request, Response } from 'express';
import {
  fetchAll,
  fetchOneById,
  createNew,
  update,
  deleteById,
} from './competition.service';
import { fetchAll as fetchAllSeasons } from '../seasons/season.service';
import { addClubToCompetition } from '../../middleware/competition';
import { addLeagueToClub } from '../../middleware/club';
import respond from '../../helpers/responseHandler';
import { getCurrentCounter } from '../../middleware/player';
import { incrementCounter } from '../../utils/counter';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
  const response = fetchAll();

  response
    .then((competitions) => {
      respond.success(
        res,
        200,
        'Competitions fetched successfully',
        competitions
      );
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Competitions', err);
    });
});

router.get('/:id', async (req: Request, res: Response) => {
  const response = fetchOneById(req.params.id);

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

router.get('/:id/seasons/all', async (req: Request, res: Response) => {
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

router.post('/:id/update', async (req: Request, res: Response) => {
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

router.delete('/:id', (req: Request, res: Response) => {
  const response = deleteById(req.params.id);

  response
    .then((data) => {
      respond.success(res, 200, 'Competition deleted successfully', data);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Competition', err);
    });
});

router.post('/new', getCurrentCounter, async (req: Request, res: Response) => {
  // TODO: make sure you are getting the Division type from the client abeg :)
  const response = await createNew(req.body.data);

  if (!response.error) {
    respond.success(
      res,
      200,
      'Competition created successfully',
      response.result
    );
    incrementCounter('competition_counter');
  } else {
    respond.fail(res, 400, 'Error creating competition', response.result);
  }
});

router.post('/:league_id/add-club', addClubToCompetition, addLeagueToClub);

export default router;
