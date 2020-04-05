import { Request, Response, NextFunction } from 'express';
import respond from '../helpers/responseHandler';
import {
  createNew,
  findByIdAndUpdate,
} from '../controllers/seasons/season.service';
import { fetchCompetition } from '../controllers/competitions/competition.service';
import { Competition } from '../controllers/competitions/competition.model';
import { createFixtures } from '../controllers/fixtures/fixture.service';
import {
  monthFromIndex,
  generateWeekTable,
  generateFixtureObject,
} from '../utils/seasons';

export async function createSeason(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // tslint:disable-next-line: variable-name
  const monthNumber = new Date(req.body.data.StartDate).getMonth();

  const month = monthFromIndex(monthNumber);

  req.body.data.CompetitionCode = req.body.data.CompetitionCode.toUpperCase();

  const { SeasonID } = req.body.data;

  const seasonCode =
    req.body.data.CompetitionCode +
    '-' +
    month +
    '-' +
    SeasonID.charAt(SeasonID.length - 1);

  req.body.data.SeasonCode = seasonCode;

  const _response = await createNew(req.body.data);

  if (!_response.error) {
    req.body.seasonMongoID = _response.result._doc._id;
    next();
  } else {
    respond.fail(res, 400, 'Error creating Season', _response.result);
  }
}

/**
 * fetch season clubs
 * in the req.body object...
 * competitionId,
 * seasonId,
 * leagueCode,
 *
 * @param req
 * @param res
 * @param next
 */
export async function fetchCompetitionClubs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { competitionId } = req.body.data as GenerateFixturesBody;

  const response = fetchCompetition(competitionId);

  response
    .then((value) => {
      req.body.competition = value;
      next();
    })
    .catch((error) => {
      respond.fail(res, 400, 'Error fetching competition', error);
    });
}

interface GenerateFixturesBody {
  seasonCode: string;
  leagueCode: string;
  competitionId: string;
}

export async function generateFixtures(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const competition: Competition = req.body.competition;

  const { seasonCode } = req.body.data as GenerateFixturesBody;

  const { leagueCode } = req.body.data as GenerateFixturesBody;

  const seasonId = req.params.id;

  const matchesPerWeek = Math.round(competition.Clubs.length / 2);

  // Round Robin fixtures algorithm
  // h -> Home team , a -> Away team
  // the numbers are the Club numbers

  const roundrobin = [
    { h: 1, a: 4 },
    { h: 2, a: 3 },
    { h: 1, a: 3 },
    { h: 4, a: 2 },
    { h: 1, a: 2 },
    { h: 3, a: 4 },
    { h: 4, a: 1 },
    { h: 3, a: 2 },
    { h: 3, a: 1 },
    { h: 2, a: 4 },
    { h: 2, a: 1 },
    { h: 4, a: 3 },
  ];

  const fixtureObjects = roundrobin.map((fixture, index) => {
    const home = competition.Clubs[fixture.h - 1];
    const away = competition.Clubs[fixture.a - 1];
    return generateFixtureObject(
      home._id,
      away._id,
      home.ClubCode,
      away.ClubCode,
      home.Name,
      away.Name,
      seasonCode,
      seasonId,
      leagueCode,
      home.Stadium.Name,
      index,
      matchesPerWeek
    );
  });

  // respond.success(res, 200, 'Success creating Fixtures', fixtureObjects);

  const response = createFixtures(fixtureObjects);

  response
    .then((fixtures) => {
      const fixtureIds: string[] = fixtures.map((fixture) => {
        return fixture._id;
      });

      req.body.fixtureIds = fixtureIds;
      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error creating Fixtures', err);
    });
}

export function setInitialStandings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const competition: Competition = req.body.competition;

  const seasonId = req.params.id;

  const numberOfMatches: number =
    (competition.Clubs.length - 1) * competition.Clubs.length;

  const matchesPerWeek = Math.round(competition.Clubs.length / 2);

  const numberOfWeeks: number = numberOfMatches / matchesPerWeek;

  const weeks = [];

  for (let i = 1; i <= numberOfWeeks; i++) {
    const week: { Week: number; Table: any[] } = {
      Week: i,
      Table: [],
    };

    week.Table = generateWeekTable(competition.Clubs);

    weeks.push(week);
  }

  const response = findByIdAndUpdate(seasonId, { Standings: weeks });

  response
    .then((season) => {
      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error creating Fixtures', err);
    });
}
