/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Router, Request, Response } from 'express';
import {
  fetchAll,
  fetchOneById,
  deleteById,
  findByIdAndUpdate,
} from './season.service';
import { SeasonInterface } from './season.model';
import {
  fetchAll as fetchAllFixtures,
  deleteAll as deleteManyFixtures,
} from '../fixtures/fixture.service';
import {
  createSeason,
  fetchCompetitionClubs,
  generateFixtures,
  setInitialStandings,
} from '../../middleware/seasons';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';
import { addSeasonToCompetition } from '../competitions/competition.controller';
import { update as updateComp } from '../competitions/competition.service';
import { finishSeason, getCurrentSeasons } from './season.controller';
import respond from '../../helpers/responseHandler';
import { compileStandings } from '../../utils/seasons';
import { giveAwards } from '../awards/awards.controller';
import { setupRoutes } from '../../helpers/queries';

const router = Router();

/** Get all Seasons */
router.get('/', (req: Request, res: Response) => {
  // TODO: review all these your service then, async/awaits. Thank you Jesus!
  fetchAll()
    .then((seasons: any) => {
      return respond.success(res, 200, 'Seasons fetched successfully', seasons);
    })
    .catch((err: any) => {
      return respond.fail(res, 400, 'Error fetching Seasons', err);
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

/** FINISH SEASON */
router.post('/:id/finish', finishSeason, giveAwards);

/** Get all Fixtures in Season */
router.get('/:id/fixtures', (req, res) => {
  fetchAllFixtures({ Season: req.params.id }, req.query.select || "")
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
router.get('/:year/current', getCurrentSeasons);

// I moved these endpoiints down here because it was matching 'seasons/current' causing an error.

/** Get Season by id */
router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;

  // Use validators here...
  if (!id) {
    return respond.fail(res, 404, 'Please provide valid Season ID!');
  }

  const {populate} = req.query;
  let p;
  console.log(populate);

  try {
    p = JSON.parse(populate);
  } catch(e) {
    console.error(e);
    console.log('Could not parse Season populate')
  }

  console.log(p)

  fetchOneById(id, false, populate)
    .then((season: any) => {
      if (!season.Title)
        return respond.success(res, 404, 'Season not found!', season);

      season.CompiledStandings = compileStandings(season.Standings);

      return respond.success(res, 200, 'Season fetched successfully', season);
    })
    .catch((err: any) => {
      return respond.fail(res, 400, 'Error fetching Season', err);
    });
});

// get current setInitialStandings
router.get('/:id/standings', (req: Request, res: Response) => {
  fetchOneById(req.params.id, 'Standings')
    .then((s: any) => {
      const standings = compileStandings(s.Standings);

      respond.success(
        res,
        200,
        'Season Standings fetched successfully',
        standings
      );
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Season Standings', err);
    });
});

/** Delete Season by id */
router.delete('/:id', (req: Request, res: Response) => {
  // fifrst delete the season, then remove the ref of the season from the competitions array
  const id = req.params.id;

  // Use validators here...
  if (!id) {
    return respond.fail(res, 404, 'Please provide valid Season ID!');
  }

  const deleteSeason = () => {
    return deleteById(id);
  };

  const deleteFixtures = () => {
    const q = { Season: id };

    return deleteManyFixtures(q);
  };

  const removeSeasonFromComp = (season: SeasonInterface) => {
    const q = { _id: season.Competition };
    const cmp = season.Competition as string;

    return updateComp(cmp, { $pull: { Seasons: id } });
  };

  deleteSeason()
    .then(removeSeasonFromComp)
    .then(deleteFixtures)
    .then((done) => {
      return respond.success(res, 200, 'Season deleted successfully');
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Error deleting Season', err);
    });
});

router.get('/:id/awards', giveAwards);

setupRoutes(router, 'Season');

export default router;
