import { Request, Response, NextFunction } from 'express';
import respond from '../helpers/responseHandler';
import {
  createNew,
  findByIdAndUpdate,
} from '../controllers/seasons/season.service';
import { fetchCompetition } from '../controllers/competitions/competition.service';
import { CompetitionInterface } from '../controllers/competitions/competition.model';
import { createFixtures } from '../controllers/fixtures/fixture.service';
import {
  monthFromIndex,
  generateWeekTable,
  generateFixtureObject,
  RoundRobin,
  fixtureInterface,
} from '../utils/seasons';
import { fetchOne } from '../controllers/calendar/calendar.service';
import { CalendarInterface } from '../controllers/calendar/calendar.model';
import { incrementCounter } from '../utils/counter';
import log from '../helpers/logger';

export function createSeason(req: Request, res: Response, next: NextFunction) {
  // tslint:disable-next-line: variable-name

  /**
   * CompetitionCode,
   *
   */

  req.body.data.CompetitionCode = req.body.data.CompetitionCode.toUpperCase();

  // No two seasons of the same competition and same month and year should exist at the same time...

  // Send Year from Client.
  // In client request for a list of all the Calendars available
  const year = process.env.CURRENT_YEAR!.trim().toUpperCase();

  const seasonCode = req.body.data.CompetitionCode + ':' + year;

  // NOTE: Before we were getting Year for Season here...
  //  req.body.data.Year

  log(year);

  const findCalendar = () => {
    return fetchOne({ YearString: year });
  };

  // Add the Calendar's id to season...
  // maybe get it from the client? or find it?
  // UPDATE: no need, we can just use the Year to find it?

  // You should only be able to create a Season when there's
  // a calendar... So maybe create the season in the Current Year
  // using the Current Calendar...

  // TODO: URGENT! AND IMPORTANT! COMPLETE THIS WORK
  // TEST CREATING A SEASON LIKE THIS, thank you Jesus!
  const newSeason = (cal: CalendarInterface) => {
    if (!cal) {
      throw new Error('Calendar does not exist!');
    }
    req.body.data.SeasonCode = seasonCode;
    req.body.data.Calendar = cal._id;
    req.body.data.Year = cal.YearString;
    return createNew(req.body.data).catch((err) => {
      throw err;
    });
  };

  findCalendar()
    .then(newSeason)
    .then((season: any) => {
      void incrementCounter('season_counter');
      req.body.seasonMongoID = season._doc._id;
      return next();
    })
    .catch((error) => {
      console.error(error);
      return respond.fail(res, 400, 'Error creating Season', error);
    });
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

// TODO: remove this and move to the main function...
export function fetchCompetitionClubs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { competitionId } = req.body.data as GenerateFixturesBody;

  fetchCompetition(competitionId)
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

export function generateFixtures(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const competition: CompetitionInterface = req.body.competition;

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
      stadium: home.Stadium!.Name,
      index,
      matchesPerWeek,
      type: competition.Type.toLowerCase(),
    } as fixtureInterface;
    return generateFixtureObject(data);
  });

  // respond.success(res, 200, 'Success creating Fixtures', fixtureObjects);

  createFixtures(fixtureObjects)
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
  const competition: CompetitionInterface = req.body.competition;

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

  findByIdAndUpdate(seasonId, { Standings: weeks })
    .then((season) => {
      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error creating Fixtures', err);
    });
}
