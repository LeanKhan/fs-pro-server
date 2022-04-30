/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, NextFunction } from 'express';
import respond from '../helpers/responseHandler';
import {
  createNew,
  findByIdAndUpdate,
} from '../controllers/seasons/season.service';
import {
  addSeason,
  fetchCompetition,
} from '../controllers/competitions/competition.service';
import { CompetitionInterface } from '../controllers/competitions/competition.model';
import { createFixtures } from '../controllers/fixtures/fixture.service';
import {
  generateWeekTable,
  generateFixtureObject,
  RoundRobin,
  fixtureInterface,
} from '../utils/seasons';
import { fetchOne } from '../controllers/calendar/calendar.service';
import { CalendarInterface } from '../controllers/calendar/calendar.model';
import { incrementCounter } from '../utils/counter';
import log from '../helpers/logger';
import { ClubInterface } from '../controllers/clubs/club.model';

/**
 * Create Season :)
 *
 * @param competitionCode
 * @param competitionID
 */
export async function create(
  competitionCode: string,
  competitionID: string,
  year: string
) {
  const p = await incrementCounter('season_counter');
  console.log('Counter incremented successfully!');

  const seasonCode = competitionCode.toUpperCase() + '-' + year;

  log(year);

  const findCalendar = () => {
    return fetchOne({ YearString: year });
  };

  const newSeason = (cal: CalendarInterface) => {
    if (!cal) {
      throw new Error('Calendar does not exist!');
    }

    const data = {
      SeasonCode: seasonCode,
      CompetitionCode: competitionCode,
      Competition: competitionID,
      Calendar: cal._id,
      Year: cal.YearString,
      Status: 'pending',
      Title: `Season-${competitionCode}-${year}-${Math.round(
        Math.random() * 10
      )}`,
    };

    return createNew(data).catch((err) => {
      throw err;
    });
  };

  let season_id: string;
  let season_code: string;

  const addSeasonToComp = (season: any) => {
    season_id = season._doc._id;
    season_code = season._doc.SeasonCode;

    return addSeason(competitionID, season_id);
  };

  let competition: CompetitionInterface;

  const generateFixtures2 = async () => {
    competition = await fetchCompetition(competitionID);

    const matchesPerWeek = competition.Clubs.length / 2;

    const roundrobin = new RoundRobin(competition.Clubs.length);

    const rounds = roundrobin.generateFixtures();

    const fixtureObjects = rounds.map((fixture, index) => {
      const home = competition.Clubs[fixture.home] as ClubInterface;
      const away = competition.Clubs[fixture.away] as ClubInterface;
      const data = {
        homeId: home._id,
        awayId: away._id,
        homeCode: home.ClubCode,
        awayCode: away.ClubCode,
        homeName: home.Name,
        awayName: away.Name,
        seasonCode: season_code,
        seasonId: season_id,
        // the compettion of this fixture
        competition: competition._id,
        leagueCode: competition.CompetitionCode.toUpperCase(),
        stadium: home.Stadium!.Name,
        index,
        matchesPerWeek,
        type: competition.Type.toLowerCase(),
        isFinalMatch: index + 1 === rounds.length,
      } as fixtureInterface;
      return generateFixtureObject(data);
    });

    return fixtureObjects;
  };

  const createF = async (fixtureObjects: any) => {
    // respond.success(res, 200, 'Success creating Fixtures', fixtureObjects);

    return createFixtures(fixtureObjects)
      .then((fixtures) => {
        const fixtureIds: string[] = fixtures.map((fixture) => {
          return fixture._id;
        });

        return fixtureIds;
      })
      .catch((err) => {
        throw err;
      });
  };

  const saveFixtures = (fixtureIds: string[]) => {
    return findByIdAndUpdate(season_id, { Fixtures: fixtureIds });
  };

  // TODO: Make standings separate collection
  const setInitialStandings = () => {
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

      week.Table = generateWeekTable(competition.Clubs as ClubInterface[]);

      weeks.push(week);
    }

    /**
     * This is the Updated Season! Thank you Jesus!
     */
    return findByIdAndUpdate(season_id, { Standings: weeks });
  };

  return findCalendar()
    .then(newSeason)
    .then(addSeasonToComp)
    .then(generateFixtures2)
    .then(createF)
    .then(saveFixtures)
    .then(setInitialStandings);
}

export function createSeason(req: Request, res: Response, next: NextFunction) {
  // tslint:disable-next-line: variable-name

  /**
   * Get list of all competitions and create seasons for them based on the current year,
   * then update the Calendar by adding dates!
   *
   */

  req.body.data.CompetitionCode = req.body.data.CompetitionCode.toUpperCase();

  // No two seasons of the same competition and same month and year should exist at the same time...

  // Send Year from Client.
  // In client request for a list of all the Calendars available
  const year = process.env.CURRENT_YEAR!.trim().toUpperCase();

  const seasonCode = req.body.data.CompetitionCode + '-' + year;

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
    .then((value: any) => {
      req.body.competition = value;
      next();
    })
    .catch((error: any) => {
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
    const home = competition.Clubs[fixture.home] as ClubInterface;
    const away = competition.Clubs[fixture.away] as ClubInterface;
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
      isFinalMatch: index + 1 === rounds.length,
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

    week.Table = generateWeekTable(competition.Clubs as ClubInterface[]);

    weeks.push(week);
  }

  findByIdAndUpdate(seasonId, { Standings: weeks })
    .then((season: any) => {
      next();
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error creating Fixtures', err);
    });
}
