import { Router, Request, Response } from 'express';
import { fetchAll, fetchOneById, createNew } from './competition.service';
import { addClubToCompetition } from '../../middleware/competition';
import { addLeagueToClub } from '../../middleware/club';
import respond from '../../helpers/responseHandler';
import { getCurrentCounter } from '../../middleware/player';
import { incrementCounter } from '../../utils/counter';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
  const response = await fetchAll();

  if (!response.error) {
    respond.success(
      res,
      200,
      'Competitions fetched successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error fetching competitions', response.result);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const response = await fetchOneById(req.params.id);

  if (!response.error) {
    respond.success(
      res,
      200,
      'Competition fetched successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error fetching competition', response.result);
  }
});

router.post('/new', getCurrentCounter, async (req: Request, res: Response) => {
  const response = await createNew(req.body);

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
