import { Router, Request, Response } from 'express';
import { fetchAll, fetchOneById, createNew } from './competition.service';
import respond from '../../helpers/responseHandler';

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

router.get('/competition/:id', async (req: Request, res: Response) => {
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

router.post('/competition/new', async (req: Request, res: Response) => {
  const response = await createNew(req.body);

  if (!response.error) {
    respond.success(
      res,
      200,
      'Competition created successfully',
      response.result
    );
  } else {
    respond.fail(res, 400, 'Error creating competition', response.result);
  }
});

// router.get('/competition/:id', async (req: Request, res: Response) => {
//     const response = await fetchOneById(req.params.id);

//     if (!response.error) {
//       respond.success(res, 200, 'Competition fetched successfully', response.result);
//     } else {
//       respond.fail(res, 400, 'Error fetching competition', response.result);
//     }
// });
