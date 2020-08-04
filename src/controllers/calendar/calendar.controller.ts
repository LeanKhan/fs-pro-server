import { Request, Response, NextFunction } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchAll } from '../seasons/season.service';
import { createMany } from '../days/day.service';
import { Types } from 'mongoose';
import { Fixture } from '../fixtures/fixture.model';
import {
  CalendarDay,
  CalendarMatch,
  CalendarInterface,
} from './calendar.model';
import { monthFromIndex } from '../../utils/seasons';
import { createNew, fetchOne } from './calendar.service';

export async function getSeasons(
  req: Request,
  res: Response,
  next: NextFunction
) {
  /**
   * 1. Get the latest seasons of the Competitions involved ...
   * 2. Create Calendar Days by pushing Season fixtures to Calendar with maybe some free days inbetween..
   * 3. Let's gooo!
   * 4. Thank you Jesus...
   */

  const { month, year } = req.query;
  const newYear = month.toUpperCase() + '-' + year;
  let competitions = [];

  try {
    competitions = req.body.competitions.map(
      (c: { id: string; code: string; division: string; type: string }) => {
        try {
          return Types.ObjectId(c.id);
        } catch (error) {
          throw new Error('Competition ID is worng! => ' + error);
        }
      }
    );
    // console.log(Types.ObjectId.re); // competitions: [{compeition'_id', 'BFC'},'_id']
  } catch (error) {
    return respond.fail(res, 400, 'Error! => ' + error, { error });
  }

  // now find the seasons with these parameters [${compCode}-${Month}-${Year}]
  // const seasons = findAll
  // Find the seasons that are in these competitions and this year
  const query = { Competition: { $in: competitions }, Year: newYear };
  try {
    const seasons = await fetchAll(
      query,
      'Fixtures',
      'Fixtures Standings CompetitionCode'
    );
    if (seasons.length === 0) {
      return respond.fail(res, 404, 'No Seasons found!', seasons);
    }
    req.body.seasons = seasons;
    return next();
  } catch (error) {
    return respond.fail(res, 400, 'Failed to get seasons \n ' + error, error);
  }
}

export async function generateCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // days = 200...
  // const { number_of_days } = req.query;

  // req.body.seasons.
  const competitions = req.body.competitions as [
    { id: string; code: string; division: string; type: string }
  ];
  const firstDivisionLeague = competitions.find(
    (c) => c.division === 'first' && c.type === 'league'
  ); // ideally, the first competition you pass is the first one...

  const secondDivisionLeague = competitions.find(
    (c) => c.division === 'second' && c.type === 'league'
  ); // ideally, the first competition you pass is the first one...

  const cup = competitions.find((c) => c.type === 'cup'); // ideally, the first competition you pass is the first one...

  // now create days...

  const firstDivisionFixtures = req.body.seasons.find(
    (s: any) => s.CompetitionCode === firstDivisionLeague!.code
  ).Fixtures;
  const secondDivisionFixtures = req.body.seasons.find(
    (s: any) => s.CompetitionCode === secondDivisionLeague!.code
  ).Fixtures;

  const firstDivisionMatchesPerWeek =
    firstDivisionFixtures.length /
    req.body.seasons.find(
      (s: any) => s.CompetitionCode === firstDivisionLeague!.code
    ).Standings.length;

  const secondDivisionMatchesPerWeek =
    secondDivisionFixtures.length /
    req.body.seasons.find(
      (s: any) => s.CompetitionCode === secondDivisionLeague!.code
    ).Standings.length;

  let firstDivisionDays: CalendarDay[] = [];

  // Use the number of matches in the season to get the one that

  try {
    firstDivisionDays = firstDivisionFixtures.map(
      (fixture: Fixture, index: number) => {
        const Match: CalendarMatch[] = [
          {
            Fixture: fixture._id,
            Competition: fixture.LeagueCode,
            MatchType: fixture.Type,
            Played: false,
            Time: `${1}`,
            Week: Math.ceil((index + 1) / firstDivisionMatchesPerWeek),
          },
        ];
        return { Matches: Match, isFree: false };
      }
    );
  } catch (error) {
    return respond.fail(res, 400, 'Failed!', error);
  }

  try {
    firstDivisionDays = firstDivisionDays.map(
      (day: CalendarDay, index: number) => {
        const Match: CalendarMatch = {
          Fixture: secondDivisionFixtures[index]._id,
          Competition: secondDivisionFixtures[index].LeagueCode,
          MatchType: secondDivisionFixtures[index].Type,
          Played: false,
          Time: `${2}`,
          Week: Math.ceil((index + 1) / secondDivisionMatchesPerWeek),
        };
        return { Matches: [...day.Matches, Match], isFree: false };
      }
    );
  } catch (error) {
    return respond.fail(
      res,
      400,
      'Failed to generate second division days! ' + error
    );
  }

  // respond.success(res, 200, 'Done :p', firstDivisionDays);
  // Here add like 20 free days?
  let completeDays: CalendarDay[] = [];
  firstDivisionDays.forEach((day, i) => {
    if ((i + 1) % 3 === 0 || (i + 1) % 4 === 0) {
      const emptyDay: CalendarDay = {
        Matches: [],
        isFree: true,
      };
      return completeDays.push(day, emptyDay);
    }

    completeDays.push(day);
  });

  const freeDays = Array(20).fill({
    Matches: [],
    isFree: true,
  });

  completeDays = [...completeDays, ...freeDays];

  // counts the number of days...
  completeDays.forEach((day, i) => {
    // So that every day will have a number,
    // we can easily query 'get me the matches in day 34'
    day.Day = i + 1;
  });

  // Here create the Calendar Days in the db...

  createMany(completeDays)
    .then((days) => {
      // get ids...
      req.body.days = days.map((day) => day._id);
      return next();
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Failed to create days ' + err);
    });

  // firstDivisionDays[0][0]

  // Then do what you need to do with these! :)
}

export async function saveCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const calendarDays: string[] = req.body.days;

  // TODO: move these to functions!

  const now = new Date();

  const calendar: CalendarInterface = {
    Name: now.toLocaleDateString(),
    YearString: `${monthFromIndex(now.getMonth())}-${now.getFullYear()}`,
    YearDigits: `${now.getMonth() + 1}-${now.getFullYear()}`,
    // Pass the ids of newly created calendar days instead...
    Days: calendarDays,
  };

  const response = await createNew(calendar);

  if (response.error) {
    return respond.fail(
      res,
      400,
      'Failed to create calendar!',
      response.result
    );
  } else {
    return respond.success(
      res,
      200,
      'Created calendar successfully!',
      response.result
    );
  }
}

export async function getCurrentCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get the current year calendar...
  // ERR! Use the month and year passed from the front end

  const year = req.query.year;

  // const now = new Date();
  // const currentYear = `${monthFromIndex(now.getMonth())}-${now.getFullYear()}`;

  const skip = getSkip(parseInt(req.query.page || 1), 14);
  const limit = parseInt(req.query.limit || 14);
  let response;

  try {
    response = await fetchOne({ YearString: year }, true, {
      skip,
      limit,
    });
  } catch (error) {
    return respond.fail(res, 400, 'Failed to fetch current calendar', error);
  }

  if (response) {
    return respond.success(
      res,
      200,
      'Fetched current calendar successfully! :)',
      response
    );
  } else {
    return respond.success(res, 200, 'Found none :/', {});
  }
}

function getSkip(page: number, length: number) {
  return --page * length;
}
