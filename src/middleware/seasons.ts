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
  RoundRobin,
  fixtureInterface,
} from '../utils/seasons';

export async function createSeason(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // tslint:disable-next-line: variable-name
  const startDate = new Date(req.body.data.StartDate);
  const monthNumber = startDate.getMonth();
  const year = startDate.getFullYear();

  const month = monthFromIndex(monthNumber);

  req.body.data.CompetitionCode = req.body.data.CompetitionCode.toUpperCase();

  // No two seasons of the same competition and same month and year should exist at the same time...

  const seasonCode = req.body.data.CompetitionCode + '-' + month + '-' + year;
  // SeasonID.charAt(SeasonID.length - 1);

  req.body.data.SeasonCode = seasonCode;
  req.body.data.Year = `${month.toUpperCase()}-${year}`;
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
  competitionType: string;
  competitionId: string;
}

export async function generateFixtures(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const competition: Competition = req.body.competition;

  const { leagueCode } = req.body.data as GenerateFixturesBody;

  /**
   * Things are slightly different for a Cup than for a League...
   * - A cup doesn't have all the matches before hand...
   * - A cup may have a mix of more than one type of match, e.g with revers fixtures and straigh tuo knockout!
   */

  const { id: seasonId, code: seasonCode } = req.params;

  const matchesPerWeek = competition.Clubs.length / 2;

  // Round Robin fixtures algorithm
  // h -> Home team , a -> Away team
  // the numbers are the Club numbers

  // const roundrobin = [
  //   { h: 1, a: 4 },
  //   { h: 2, a: 3 },
  //   { h: 1, a: 3 },
  //   { h: 4, a: 2 },
  //   { h: 1, a: 2 },
  //   { h: 3, a: 4 },
  //   { h: 4, a: 1 },
  //   { h: 3, a: 2 },
  //   { h: 3, a: 1 },
  //   { h: 2, a: 4 },
  //   { h: 2, a: 1 },
  //   { h: 4, a: 3 },
  // ];

  const roundrobin = new RoundRobin(competition.Clubs.length);

  const rounds = roundrobin.generateFixtures();

  const fixtureObjects = rounds.map((fixture, index) => {
    const home = competition.Clubs[fixture.home];
    const away = competition.Clubs[fixture.away];
    const data = {
      homeId: home._id,
      awayId: away._id,
      homeCode: home.ClubCode,
      awayCode: away.ClubCode,
      homeName: home.Name,
      awayName: away.Name,
      seasonCode,
      seasonId,
      leagueCode: leagueCode.toUpperCase(),
      stadium: home.Stadium.Name,
      index,
      matchesPerWeek,
      type: competition.Type.toLowerCase(),
    } as fixtureInterface;
    return generateFixtureObject(data);
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
