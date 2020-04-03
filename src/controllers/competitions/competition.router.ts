import { Router, Request, Response } from 'express';
import { fetchAll, fetchOneById, createNew, update, deleteById } from './competition.service';
import { fetchAll as fetchAllSeasons } from '../seasons/season.service';
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

router.get('/:id/seasons/all', async (req: Request, res: Response) => {
  const response = await fetchAllSeasons({Competition: req.params.id});

  if (!response.error) {
    respond.success(
      res,
      200,
      'Seasons in competition fetched successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error fetching seasons in competition', response.result);
  }
});

router.post('/update/:id', async (req: Request, res: Response) => {
  const response = await update(req.params.id, req.body.data);

  if (!response.error) {
    respond.success(
      res,
      200,
      'Competition updated successfully'
    );
  } else {
    respond.fail(res, 400, 'Error updating competition');
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const response = await deleteById(req.params.id);

    if (!response.error) {
    respond.success(
      res,
      200,
      'Competition deleted successfully :)'
    );
  } else {
    respond.fail(res, 400, 'Error deleting Competition :/');
  }
});


router.post('/new', getCurrentCounter, async (req: Request, res: Response) => {
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
