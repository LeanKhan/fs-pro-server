import { Router, Request, Response } from 'express';
import {
  fetchAll,
  fetchOneById,
  deleteById,
  findByIdAndUpdate,
} from './season.service';
import { fetchAll as fetchAllFixtures } from '../fixtures/fixture.service';
import {
  createSeason,
  fetchCompetitionClubs,
  generateFixtures,
  setInitialStandings,
} from '../../middleware/seasons';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';
import { addSeasonToCompetition } from '../competitions/competition.controller';
import { getCurrentSeasons } from './season.controller';
import respond from '../../helpers/responseHandler';

const router = Router();

/** Get all Seasons */
router.get('/all', async (req: Request, res: Response) => {
  fetchAll()
    .then((seasons) => {
      respond.success(res, 200, 'Seasons fetched successfully', seasons);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Seasons', err);
    });
});

/** Get Season by id */
router.get('/season/:id', (req: Request, res: Response) => {
  fetchOneById(req.params.id)
    .then((season) => {
      respond.success(res, 200, 'Season fetched successfully', season);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Season', err);
    });
});

/** Delete Season by id */
router.delete('/season/:id', (req: Request, res: Response) => {
  deleteById(req.params.id)
    .then((season) => {
      respond.success(res, 200, 'Season deleted successfully', season);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Season', err);
    });
});

/** Create new Season */
router.post(
  '/new',
  incrementCounter,
  getCurrentCounter,
  createSeason,
  addSeasonToCompetition
);

/** Generate Fixtures for Season */
router.post(
  '/:id/:code/generate-fixtures',
  fetchCompetitionClubs,
  generateFixtures,
  setInitialStandings,
  (req, res) => {
    const fixtureIds = req.body.fixtureIds;

    findByIdAndUpdate(req.params.id, { Fixtures: fixtureIds })
      .then((season) => {
        respond.success(
          res,
          200,
          'Fixtures created in season successfully',
          season!
        );
      })
      .catch((err) => {
        respond.fail(res, 400, 'Error setting fixtures in Season', err);
      });
  }
);

/** Start Season */
router.patch('/:id/start', (req, res) => {
  findByIdAndUpdate(req.params.id, {
    isStarted: true,
    StartDate: new Date(),
  })
    .then((season) => {
      respond.success(res, 200, 'Season started successfully', season!);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error starting Season', err);
    });
});

/** Get all Fixtures in Season */
router.get('/:id/fixtures/all', (req, res) => {
  fetchAllFixtures({ Season: req.params.id })
    .then((fixtures) => {
      respond.success(
        res,
        200,
        'Seasons Fixtures fetched successfully',
        fixtures
      );
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Season Fixtures', err);
    });
});

/** Get current Season */
router.get('/current', getCurrentSeasons);

export default router;
