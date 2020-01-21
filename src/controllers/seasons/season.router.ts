import { Router, Request, Response } from 'express';
import { fetchAll, fetchOneById, createNew } from './season.service';
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

router.get('/season/:id', async (req: Request, res: Response) => {
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

router.post('/season/new', async (req: Request, res: Response) => {
  const response = await createNew(req.body);

  if (!response.error) {
    respond.success(
      res,
      200,
      'season created successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error creating season', response.result);
  }
});

// router.get('/season/:id', async (req: Request, res: Response) => {
//     const response = await fetchOneById(req.params.id);

//     if (!response.error) {
//       respond.success(res, 200, 'season fetched successfully', response.result);
//     } else {
//       respond.fail(res, 400, 'Error fetching season', response.result);
//     }
// });
