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
router.get('/', (req: Request, res: Response) => {
  // TODO: review all these your service then, async/awaits. Thank you Jesus!
  fetchAll()
    .then((seasons: any) => {
      respond.success(res, 200, 'Seasons fetched successfully', seasons);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Seasons', err);
    });
});

/** Create new Season */
router.post('/', getCurrentCounter, createSeason, addSeasonToCompetition);

/** Generate Fixtures for Season */
router.post(
  '/:id/:code/generate-fixtures',
  fetchCompetitionClubs,
  generateFixtures,
  setInitialStandings,
  (req, res) => {
    const fixtureIds = req.body.fixtureIds;

    findByIdAndUpdate(req.params.id, { Fixtures: fixtureIds })
      .then((season: any) => {
        respond.success(
          res,
          200,
          'Fixtures created in season successfully',
          season
        );
      })
      .catch((err: any) => {
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
    .then((season: any) => {
      respond.success(res, 200, 'Season started successfully', season);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error starting Season', err);
    });
});

/** Get all Fixtures in Season */
router.get('/:id/fixtures', (req, res) => {
  fetchAllFixtures({ Season: req.params.id })
    .then((fixtures: any) => {
      respond.success(
        res,
        200,
        'Seasons Fixtures fetched successfully',
        fixtures
      );
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Season Fixtures', err);
    });
});

/** Get current Season */
router.get('/current', getCurrentSeasons);

// I moved these endpoiints down here because it was matching 'seasons/current' causing an error.

/** Get Season by id */
router.get('/:id', (req: Request, res: Response) => {
  fetchOneById(req.params.id)
    .then((season: any) => {
      respond.success(res, 200, 'Season fetched successfully', season);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Season', err);
    });
});

// get current setInitialStandings
router.get('/:id/standings', (req: Request, res: Response) => {
  fetchOneById(req.params.id)
    .then((standings: any) => {
      respond.success(res, 200, 'Season Standings fetched successfully', standings);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Season Standings', err);
    });
});

/** Delete Season by id */
router.delete('/:id', (req: Request, res: Response) => {
  deleteById(req.params.id)
    .then((season: any) => {
      respond.success(res, 200, 'Season deleted successfully', season);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error deleting Season', err);
    });
});

export default router;
