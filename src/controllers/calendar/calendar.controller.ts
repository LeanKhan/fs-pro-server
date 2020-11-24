/* eslint-disable no-useless-catch */
import { Request, Response, NextFunction } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll as fetchAllSeasons,
  findAndUpdate as updateManySeasons,
} from '../seasons/season.service';
import { createMany, findOne as findDay } from '../days/day.service';
import { Types } from 'mongoose';
import { Fixture } from '../fixtures/fixture.model';
import { CalendarInterface } from './calendar.model';
import { DayInterface, CalendarMatchInterface } from '../days/day.model';
import { indexFromMonth } from '../../utils/seasons';
import {
  createNew,
  fetchOne,
  findOneAndUpdate as updateCalendar,
  findAndUpdate as updateCalendars,
} from './calendar.service';

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
  const newYear = `${month.toUpperCase()}-${year}`;
  let competitions = [];

  try {
    competitions = req.body.competitions.map(
      (c: { id: string; code: string; division: string; type: string }) => {
        try {
          return Types.ObjectId(c.id);
        } catch (error) {
          throw new Error(`Competition ID is worng! => ${error}`);
        }
      }
    );
    // console.log(Types.ObjectId.re); // competitions: [{compeition'_id', 'BFC'},'_id']
  } catch (error) {
    return respond.fail(res, 400, `Error! => ${error}`, { error });
  }

  // now find the seasons with these parameters [${compCode}-${Month}-${Year}]
  // const seasons = findAll
  // Find the seasons that are in these competitions and this year
  const query = { Competition: { $in: competitions }, Year: newYear };
  try {
    const seasons = await fetchAllSeasons(
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

export function generateCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // days = 200...
  // const { number_of_days } = req.query;

  // req.body.seasons.

  // 1. Create the Calendar first but no Days yet...
  // 2. Create days with Calendar id and year string...
  // 3. Update Calendar with Days...
  // 4. Thank you Jesus!

  const createCalendar = async () => {
    const now = new Date();
    // const { year, month } = req.query;
    const month = process.env.CURRENT_YEAR!.split('-')[0];
    const year = process.env.CURRENT_YEAR!.split('-')[0];

    const YearString = `${month}-${year}`;

    const YearDigits = `${indexFromMonth(month)}-${year}`;

    const calendar: CalendarInterface = {
      Name: `${YearString}:${now.toLocaleDateString()}`,
      YearString,
      YearDigits,
      isActive: false,
      Days: [],
    };

    return createNew(calendar);
  };

  const createDays = (calendar: CalendarInterface) => {
    req.body.calendarID = calendar._id;
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

    let firstDivisionDays: DayInterface[] = [];

    // Use the number of matches in the season to get the one that

    try {
      firstDivisionDays = firstDivisionFixtures.map(
        (fixture: Fixture, index: number) => {
          const Match: CalendarMatchInterface[] = [
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
      throw error;
      // return respond.fail(res, 400, 'Failed!', error);
    }

    try {
      firstDivisionDays = firstDivisionDays.map(
        (day: DayInterface, index: number) => {
          const Match: CalendarMatchInterface = {
            Fixture: secondDivisionFixtures[index]._id,
            Competition: secondDivisionFixtures[index].LeagueCode,
            MatchType: secondDivisionFixtures[index].Type,
            Played: false,
            Time: `${2}`,
            Week: Math.ceil((index + 1) / secondDivisionMatchesPerWeek),
          };
          return {
            Matches: [...day.Matches, Match],
            isFree: false,
            Calendar: calendar._id as string,
            Year: calendar.YearString,
          };
        }
      );
    } catch (error) {
      throw error;
      // return respond.fail(
      //   res,
      //   400,
      //   'Failed to generate second division days! ' + error
      // );
    }

    // respond.success(res, 200, 'Done :p', firstDivisionDays);
    // Here add like 20 free days?
    let completeDays: DayInterface[] = [];
    // for (let i = 0; i < firstDivisionDays.length; i++) {
    //   if ((i + 1) % 3 === 0 || (i + 1) % 4 === 0) {
    //     const emptyDay: DayInterface = {
    //       Matches: [],
    //       isFree: true,
    //       Calendar: calendar._id as string,
    //       Year: calendar.YearString,
    //     };
    //     return completeDays.push(firstDivisionDays[i], emptyDay);
    //   }

    //   completeDays.push(firstDivisionDays[i]);
    // }

    // TODO: look at the performance of this loop... thank you Jesus!
    firstDivisionDays.forEach((day, i) => {
      if ((i + 1) % 3 === 0 || (i + 1) % 4 === 0) {
        const emptyDay: DayInterface = {
          Matches: [],
          isFree: true,
          Calendar: calendar._id as string,
          Year: calendar.YearString,
        };
        return completeDays.push(day, emptyDay);
      }

      completeDays.push(day);
    });

    const freeDays = new Array(20);
    for (let i = 0; i < 20; i++) {
      freeDays[i] = {
        Matches: [],
        isFree: true,
        Calendar: calendar._id as string,
        Year: calendar.YearString,
      };
    }

    completeDays = [...completeDays, ...freeDays];

    // counts the number of days...
    completeDays.map((day, i) => {
      // So that every day will have a number,
      // we can easily query 'get me the matches in day 34'
      return { ...day, Day: (day.Day = i + 1) };
    });

    return completeDays;
  };

  // Here create the Calendar Days in the db...
  createCalendar()
    .then(createDays)
    .then(createMany)
    .then((days) => {
      // get ids...
      console.log('Days created successfully!');
      req.body.days = days.map((day) => day._id);
      return next();
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Failed to create days ' + err);
    });

  // createMany(completeDays)

  // firstDivisionDays[0][0]

  // Then do what you need to do with these! :)
}

export function saveCalendar(req: Request, res: Response, next: NextFunction) {
  const calendarDays: string[] = req.body.days;
  const calendarID: string = req.body.calendarID;

  // TODO: move these to functions!

  // const now = new Date();

  // const calendar: CalendarInterface = {
  //   Name: now.toLocaleDateString(),
  //   YearString: `${monthFromIndex(now.getMonth())}-${now.getFullYear()}`,
  //   YearDigits: `${now.getMonth() + 1}-${now.getFullYear()}`,
  //   isActive: false,
  //   // Pass the ids of newly created calendar days instead...
  //   Days: calendarDays,
  // };

  updateCalendar({ _id: calendarID }, { Days: calendarDays })
    .then((cal) => {
      console.log('Calendar Updated successfully!');
      return respond.success(
        res,
        200,
        'New Calendar created successfully!',
        cal
      );
    })
    .catch((err) => {
      console.log('Error updating Calendar!', err);
      return respond.fail(res, 500, 'Error adding Days to Calendar!', err);
    });
  // TODO: check if you actually found the right calendar...
}

/**
 * Change the Current Day to next available day :)
 *
 * Thank you Jesus!
 *
 * @param year Calendar year
 */
export async function changeCurrentDay(year: string) {
  // Change current day...
  // Check if there is any match that day so you can move to the next day that has a match...
  // First check if all the Matches have been played...
  // const { year } = req.body;
  // Actually this is supposed to move the nearest day that is free...

  // Find the first day where all matches are not played
  // TODO: also a day that is higher than the current day...
  // TODO: you should also prevent matches from being played anyhow.
  // matches should be played in sequence
  const getNextDay = async () => {
    const query = { $nor: [{ 'Matches.Played': true }] };

    return findDay(query, false);
  };

  const updateCurrentDay = async (nextfreeday: DayInterface) => {
    return updateCalendar(
      { YearString: year },
      { CurrentDay: nextfreeday.Day }
    );
  };

  return getNextDay().then(updateCurrentDay);
}

// Have to delete all Days and create a new fresh Calendar. Test with that. Thank you Jesus!

export function startYear(req: Request, res: Response, next: NextFunction) {
  // In the future you will do a lot here tho...
  // Like reset Club money and all...
  const { year } = req.params;

  if (!year) {
    return respond.fail(res, 400, 'No year provided!');
  }

  const fetchSeasons = () => {
    // this is the wrong query. Fetch seasons that have not started and are 'pending' state
    const query = { Year: year, Status: 'pending', isFinished: false };

    return updateManySeasons(query, {
      isStarted: true,
      StartDate: new Date(),
      Status: 'started',
    });
  };

  const startCalendarYear = async (seasons: any) => {
    // This means the Seasons were not found and updated :o
    if (seasons.n === 0 && seasons.nModified === 0) {
      throw new Error('No seasons found!');
    }
    // Set the rest to false and this one to true...
    // There should be only ONE active calendar at a time. Thank you Jesus!
    return updateCalendars({}, [
      { $set: { isActive: { $eq: ['$YearString', year] }, CurrentDay: 0 } },
    ]);
  };

  fetchSeasons()
    .then(startCalendarYear)
    .then((response) => {
      // Updated calendar!
      return respond.success(
        res,
        200,
        'Calendar Year started successfully!',
        response
      );
    })
    .catch((err) => {
      console.log('Error starting year! => ', err);
      return respond.fail(res, 400, 'Error starting year!', err);
    });
}

// TODO: add the _id of Calendar to Season

export async function getCurrentCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get the current year calendar...
  // ERR! Use the month and year passed from the front end

  const year = process.env.CURRENT_YEAR!.trim() || req.query.year;
  // We can use the CURRENT_YEAR env variable
  const skip = getSkip(parseInt(req.query.page || 1), 14);
  const limit = parseInt(req.query.limit || 14);
  let response;

  let populate;

  try {
    populate = JSON.parse(req.query.populate);
  } catch (error) {
    console.log("Couldn't parse populate query param");
    populate = false;
  }

  try {
    response = await fetchOne({ YearString: year }, populate, {
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
    return respond.fail(res, 404, 'Found none :/', {});
  }
}

function getSkip(page: number, length: number) {
  return --page * length;
}
