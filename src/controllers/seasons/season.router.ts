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
import { getCurrentCounter } from '../../middleware/player';
import { addSeasonToCompetition } from '../../middleware/competition';
import { getCurrentSeasons } from './season.controller';
import respond from '../../helpers/responseHandler';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
  const response = fetchAll();

  response
    .then((seasons) => {
      respond.success(res, 200, 'Seasons fetched successfully', seasons);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Seasons', err);
    });
});

router.get('/season/:id', (req: Request, res: Response) => {
  const response = fetchOneById(req.params.id);

  response
    .then((season) => {
      respond.success(res, 200, 'Season fetched successfully', season);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Season', err);
    });
});

router.delete('/season/:id', (req: Request, res: Response) => {
  const response = deleteById(req.params.id);

  response
    .then((season) => {
      respond.success(res, 200, 'Season deleted successfully', season);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Season', err);
    });
});

router.post('/new', getCurrentCounter, createSeason, addSeasonToCompetition);

/**
 * Generate Fixtures for the Season
 */
router.post(
  '/:id/:code/generate-fixtures',
  fetchCompetitionClubs,
  generateFixtures,
  setInitialStandings,
  (req, res) => {
    const fixtureIds = req.body.fixtureIds;

    const response = findByIdAndUpdate(req.params.id, { Fixtures: fixtureIds });

    response
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

router.patch('/:id/start', (req, res) => {
  const response = findByIdAndUpdate(req.params.id, {
    isStarted: true,
    StartDate: new Date(),
  }).then();

  response
    .then((season) => {
      respond.success(res, 200, 'Season started successfully', season!);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error starting Season', err);
    });
});

router.get('/:id/fixtures/all', (req, res) => {
  const response = fetchAllFixtures({ Season: req.params.id });

  response
    .then((fixtures) => {
      respond.success(
        res,
        200,
        'Seasons Fixtures fetched successfully',
        fixtures
      );
    })
    .catch((err) => {
      respond.fail(res, 400, "Error fetching Season' Fixtures", err);
    });
});

router.get('/current', getCurrentSeasons);

export default router;
