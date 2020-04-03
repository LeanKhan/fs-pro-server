import { Router, Request, Response } from 'express';
import { fetchAll, fetchOneById, createNew, deleteById } from './season.service';
import { createSeason } from '../../middleware/seasons';
import { getCurrentCounter } from '../../middleware/player';
import { addSeasonToCompetition } from '../../middleware/competition';
import respond from '../../helpers/responseHandler';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
  const response = await fetchAll();

  if (!response.error) {
    respond.success(
      res,
      200,
      'Seasons fetched successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error fetching Seasons', response.result);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const response = await fetchOneById(req.params.id);

  if (!response.error) {
    respond.success(
      res,
      200,
      'season fetched successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error fetching season', response.result);
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const response = await deleteById(req.params.id);

    if (!response.error) {
    respond.success(
      res,
      200,
      'Season deleted successfully :)'
    );
  } else {
    respond.fail(res, 400, 'Error deleting Season :/');
  }
});

router.post('/new', getCurrentCounter, createSeason, addSeasonToCompetition);
// router.get('/season/:id', async (req: Request, res: Response) => {
//     const response = await fetchOneById(req.params.id);

//     if (!response.error) {
//       respond.success(res, 200, 'season fetched successfully', response.result);
//     } else {
//       respond.fail(res, 400, 'Error fetching season', response.result);
//     }
// });

export default router;