/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-useless-catch */
import { Request, Response, NextFunction } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll as fetchAllSeasons,
  findAndUpdate as updateManySeasons,
} from '../seasons/season.service';
import { createMany, findOne as findDay } from '../days/day.service';
import { Fixture } from '../fixtures/fixture.model';
import { CalendarInterface } from './calendar.model';
import { DayInterface, CalendarMatchInterface } from '../days/day.model';
import {
  indexFromMonth,
  monthFromIndex,
  randomCode,
} from '../../utils/seasons';
import {
  createNew,
  fetchOne,
  findOneAndUpdate as updateCalendar,
  findAndUpdate as updateCalendars,
  fetchOneById,
} from './calendar.service';
import log from '../../helpers/logger';
import { CompetitionInterface } from '../competitions/competition.model';
import { SeasonInterface } from '../seasons/season.model';
import { fetchAll } from '../competitions/competition.service';
import { create } from '../../middleware/seasons';
import { prolegate } from '../seasons/season.controller';

/**
 * Create Calendar Year
 *
 * TODO: IF ANY PART OF CREATING A CALENDAR FAILS, DELETE ALL
 * CREATED DOCUMENTS
 */
export function createCalendarYear(req: Request, res: Response) {
  const now = new Date();

  const month = req.query.override_month
    ? randomCode(3)
    : monthFromIndex(now.getMonth());
  const year = now.getFullYear();

  const YearString = `${month}-${year}`;

  const YearDigits = `${
    req.query.override_month
      ? Math.round(Math.random() * 99)
      : indexFromMonth(month) + 1
  }-${year}`;
  // TODO: lowks, YearDigits is useless :)
  const calendar: CalendarInterface = {
    Name: `${YearString}:fspro`,
    YearString,
    YearDigits,
    isActive: false,
    isEnded: false,
    allSeasonsCompleted: false,
    Days: [],
  };

  return createNew(calendar)
    .then((c) => {
      console.log('Calendar Year created successfully! Thank you Jesus!');
      return respond.success(res, 200, 'Calendar Year created succesfully!', c);
    })
    .catch((e) => {
      console.log(`Calendar Year could not be created!`);
      console.error(e);
      return respond.fail(res, 400, 'Failed to create Calendar Year ', e);
    });
}

/** NEW */
/**
 * Create all the Seasons of Competitions in the Year
 * @param req
 * @param res
 * @param next
 */
export async function createSeasonsInTheYear(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const competitions: CompetitionInterface[] = await fetchAll();
  const year: string = req.params.year.trim().toUpperCase();

  // create a season for all competitions that are available.
  const competition_seasons = competitions.map((c) => {
    return create(c.CompetitionCode, c._id as string, year);
  });

  Promise.all(competition_seasons)
    .then(() => {
      console.log('Seasons for the Year created Successfully!');
      return next();
    })
    .catch((err) => {
      console.log('Could not create Seasons for the Year!');
      console.error(err);

      return respond.fail(
        res,
        400,
        'Error creating Seasons for the Year',
        err.toString()
      );
    });
}

/** NEW
 * Start Calendar Year...
 *
 * Add Days to Calendar filled by Fixtures
 * @param req
 * @param res
 * @param next
 */
export function setupDaysInYear(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const fetchCalendar = () => {
    // this is the Calendar ID!
    return fetchOneById(req.params.id);
  };

  let _calendar: CalendarInterface;

  const createDays = async (calendar: CalendarInterface) => {
    _calendar = calendar;

    const competitions: CompetitionInterface[] = await fetchAll();
    const seasons: SeasonInterface[] = await fetchAllSeasons({
      Year: _calendar.YearString,
    });

    /**
     * TODO URGENT APRIL 26 2022
     * 1. Create all the days in the year.
     * 2. For each 'league' competition, add all matches to the days.
     * 3. You can add multiple matches of the same league to a day.
     */

    // TODO: all these CompetitionCode should not be case sensitive!

    // get all competitions...
    const firstDivisionLeague = competitions.find(
      (c) => c.Division === 1 && c.Type === 'league'
    ); // ideally, the first competition you pass is the first one...

    const secondDivisionLeague = competitions.find(
      (c) => c.Division === 2 && c.Type === 'league'
    ); // ideally, the first competition you pass is the first one...

    const cup = competitions.find((c) => c.Type === 'cup'); // ideally, the first competition you pass is the first one...

    const firstDivision: SeasonInterface = seasons.find(
      (s: any) => s.CompetitionCode === firstDivisionLeague?.CompetitionCode
    ) as SeasonInterface;
    const secondDivision: SeasonInterface = seasons.find(
      (s: any) => s.CompetitionCode === secondDivisionLeague?.CompetitionCode
    ) as SeasonInterface;

    // now create days...
    const firstDivisionFixtures = firstDivision.Fixtures;
    const secondDivisionFixtures = secondDivision.Fixtures;

    const firstDivisionMatchesPerWeek =
      firstDivisionFixtures.length / firstDivision.Standings.length;

    const secondDivisionMatchesPerWeek =
      secondDivisionFixtures.length / secondDivision.Standings.length;

    let firstDivisionDays: DayInterface[] = [];

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
    }

    let completeDays: DayInterface[] = [];

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

    /**
     * New Days.
     *
     * - Create all 365 empty days first
     * - Later change no. of days if leap year.
     * - Then starting from Day 0, append matches of all Seasons into each day
     *
     */

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

    completeDays.map((day, i) => {
      return { ...day, Day: (day.Day = i + 1) };
    });

    return completeDays;
  };

  const saveCalendar = (calendarDays: string[]) => {
    const calendarID: string = _calendar._id as string;

    updateCalendar({ _id: calendarID }, { Days: calendarDays })
      .then((cal: any) => {
        log('Calendar Updated successfully!');
        // this can just go next tho :)
        req.body.new_cal = cal;

        return next();
        // return respond.success(
        //   res,
        //   200,
        //   'New Calendar created successfully!',
        //   cal
        // );
      })
      .catch((err: any) => {
        log(`Error updating Calendar! => ${err}`);
        console.error(err);
        console.log('Error updating calendar!', err);
        return respond.fail(res, 500, 'Error adding Days to Calendar!', err);
      });
    // TODO: check if you actually found the right calendar...
  };

  // Here create the Calendar Days in the db...
  fetchCalendar()
    .then(createDays)
    .then(createMany)
    .then((days: any) => {
      // get ids...
      log('Days created successfully!');
      return days.map((day: any) => day._id);
    })
    .then(saveCalendar)
    .catch((err: any) => {
      console.error(err);
      console.log('Failed to create Seasons and update Calendar!', err);
      return respond.fail(res, 400, 'Failed to add Days to Calendar', err);
    });
}

export function setupDaysInYear2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const fetchCalendar = () => {
    // this is the Calendar ID!
    return fetchOneById(req.params.id);
  };

  const DAYS_IN_YEAR = 365;

  let _calendar: CalendarInterface;

  /**
   * 1.  Create 365 Days with empty Matches
   * 2.  For each Season arrange Fixtures in Days
   * 3. Return Days.
   * */

  const createDays = async (calendar: CalendarInterface) => {
    _calendar = calendar;

    const freeDays = new Array(DAYS_IN_YEAR);
    for (let i = 0; i < DAYS_IN_YEAR; i++) {
      freeDays[i] = {
        Matches: [],
        isFree: true,
        Calendar: calendar._id as string,
        Day: i + 1,
        Year: calendar.YearString,
      };
    }

    const competitions: CompetitionInterface[] = await fetchAll();

    /**
     * TODO URGENT APRIL 26 2022
     * 1. Create all the days in the year.
     * 2. For each 'league' competition, add all matches to the days.
     * 3. You can add multiple matches of the same league to a day.
     */

    // TODO: all these CompetitionCode should not be case sensitive!

    // get all competitions... TODO: use Mongo to query
    const AllLeagues = competitions
      .filter((c) => c.Type === 'league')
      .map((c) => c._id); // only get leagues

// Get all Seasons in this new year that
// belong to a League and sort by their Competition Code.
// Thank you Jesus!
    const AllLeagueSeasonsThisYear: SeasonInterface[] = await fetchAllSeasons({
      Year: _calendar.YearString,
      Competition: { $in: AllLeagues },
    }, false, false, {"CompetitionCode": 1});

    return { days: freeDays, seasons: AllLeagueSeasonsThisYear };
  };

  const arrangeFixturesInDays = ({
    days,
    seasons,
  }: {
    days: DayInterface[];
    seasons: SeasonInterface[];
  }) => {
    seasons.forEach((s: SeasonInterface, i: number) => {
      const MatchesPerWeek = s.Fixtures.length / s.Standings.length;
      const NumberOfWeeks = s.Standings.length;

      setupDays(MatchesPerWeek, NumberOfWeeks);

      function createFixtureObject(
        fx: Fixture,
        compCode: any,
        compId: any,
        time: number,
        fixture_index: number,
        week: number
      ) {
        const Match: CalendarMatchInterface = {
          // subtracting 1 because Fixture starts from 1;
          Fixture: fx._id,
          Competition: compCode,
          CompetitionId: compId,
          MatchType: fx.Type,
          Played: false,
          // This Time field is almost useless. We cnan use the Fixture's array position to
          // know the 'position in time' of this match. If we ever need to know.
          Time: time + '',
          FixtureIndex: fixture_index,
          Week: week,      
        };

        return Match;
      }

      function arrange(
        matches_in_week: number,
        Fixture: number,
        Day: number
      ): { Fixture: number; Day: number } {
        // debugger;
        if (matches_in_week > 0 && matches_in_week <= 3) {
          // TODO: move to a function
          for (let a = 0; a < matches_in_week; a++) {
            console.log(`Putting Fixture ${Fixture} of ${s.CompetitionCode} in Day ${Day}`);
            const m = createFixtureObject(
              s.Fixtures[Fixture - 1],
              s.CompetitionCode,
              s.Competition,
              2,
              Fixture,
              Math.ceil(Fixture / MatchesPerWeek)
            );

            // subtracting 1 because Day counter starts from 1 :)
            days[Day - 1].Matches.push(m);

            Fixture++;
          }

          matches_in_week -= matches_in_week;
        }

        if (matches_in_week >= 5) {
          // Fixture += 2;
          for (let b = 0; b < 5; b++) {
            console.log(`Putting Fixture ${Fixture} of ${s.CompetitionCode} in Day ${Day}`);

            const m = createFixtureObject(
              s.Fixtures[Fixture - 1],
              s.CompetitionCode,
              s.Competition,
              2,
              Fixture,
              Math.ceil(Fixture / MatchesPerWeek)
            );

            days[Day - 1].Matches.push(m);

            Fixture++;
          }

          matches_in_week -= 5;
        }

        // finished arranging in current Day. Change to not free, then move
        days[Day - 1].isFree = false;
        Day += 1;
        console.log(`--- Now in Day ${Day} ---`);

        if (Day % 2 == 0) {
          console.log(`Skipping Day ${Day}...`);
          Day += 1; // skip a day
        }

        if (matches_in_week != 0) {
          return arrange(matches_in_week, Fixture, Day);
        }

        return { Fixture, Day };
      }

      function setupDays(MatchesInWeek: number, NumberOfWeeks: number) {
        let Day = 1;
        let Fixture = 1;

        const TotalFixtures = MatchesInWeek * NumberOfWeeks;
        const TotalDays = DAYS_IN_YEAR;

        while (Fixture <= TotalFixtures) {
          const matches_in_week = MatchesInWeek;

          ({ Fixture, Day } = arrange(matches_in_week, Fixture, Day));
        }
      }
    });

    // at the end of this loop, all_days should be full of Days filled with Fixtures. Thank you Jesus!
    return days;
  };

  const saveCalendar = (calendarDays: string[]) => {
    const calendarID: string = _calendar._id as string;

    updateCalendar({ _id: calendarID }, { Days: calendarDays })
      .then((cal: any) => {
        log('Calendar Updated successfully: Days added!');
        // this can just go next tho :)
        req.body.new_cal = cal;

        return next();
        // return respond.success(
        //   res,
        //   200,
        //   'New Calendar created successfully!',
        //   cal
        // );
      })
      .catch((err: any) => {
        log(`Error updating Calendar! => ${err}`);
        console.error(err);
        console.log('Error updating calendar!', err);
        return respond.fail(res, 500, 'Error adding Days to Calendar!', err);
      });
    // TODO: check if you actually found the right calendar...
  };

  // Here create the Calendar Days in the db...
  fetchCalendar()
    .then(createDays)
    .then(arrangeFixturesInDays)
    .then(createMany)
    .then((days: any) => {
      // get ids...
      log('Days created successfully!');
      return days.map((day: any) => day._id);
      // return respond.success(res, 200, 'Generated Days to Calendar!', days);
    })
    .then(saveCalendar)
    .catch((err: any) => {
      console.error(err);
      console.log('Failed to create Seasons and update Calendar!', err);
      return respond.fail(res, 400, 'Failed to add Days to Calendar', err.toString());
    });
}

/**
 * Change the Current Day to next available day :)
 *
 * Thank you Jesus!
 *
 * @param year Calendar year
 */
export async function changeCurrentDay(year: string, currentDay: DayInterface) {
  // Change current day...
  // Check if there is any match that day so you can move to the next day that has a match...
  // First check if all the Matches have been played...
  // const { year } = req.body;
  // Actually this is supposed to move the nearest day that is free...

  // Find the first day where all matches are not played
  // TODO: also a day that is higher than the current day...
  // TODO: you should also prevent matches from being played anyhow.
  // matches should be played in sequence
  // Added in JUl-11-21: Also, a day that actually has matches shey?
  const getNextDay = async () => {
    const query = {
      $nor: [{ 'Matches.Played': true }],
      Year: year,
      isFree: false,
      Day: { $gt: currentDay.Day },
    };

    return findDay(query, false);
  };

  function updateCurrentDay(nextfreeday: DayInterface) {
    // if this doesn't return a calendar, doesn't that mean all games have been played in all days?

    if (nextfreeday == null) {
      // If there is no nextFreeDay (last playable match of the Year), so maybe just keep the Calendat CurrentDay
      return updateCalendar(
        { YearString: year },
        { CurrentDay: currentDay.Day }
      );
    }

    return updateCalendar(
      { YearString: year },
      { CurrentDay: nextfreeday.Day }
    );
  }

  return getNextDay().then(updateCurrentDay);
}

export function startYear(req: Request, res: Response) {
  const { year } = req.params;

  if (!year) {
    return respond.fail(
      res,
      400,
      'Could Not Start Calendar Year - No year provided!'
    );
  }

  const fetchSeasons = () => {
    // this is the wrong query. Fetch seasons that have not started and are 'pending' state
    const query = {
      Year: year,
      Status: 'pending',
      isStarted: false,
      isFinished: false,
    };

    return updateManySeasons(query, {
      isStarted: true,
      StartDate: new Date(),
      Status: 'started',
    });
  };

  const startCalendarYear = (seasons: any) => {
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
    .then((response: any) => {
      // Updated calendar!
      return respond.success(
        res,
        200,
        'Calendar Year Created, Setup and Started successfully!',
        response
      );
    })
    .catch((err: any) => {
      log(`Error starting year!`, err);
      return respond.fail(res, 400, 'Error starting year!', err);
    });
}

// TODO: add the _id of Calendar to Season

export async function getCurrentCalendar(req: Request, res: Response) {
  const skip = getSkip(parseInt(req.query.page || 1), 14);
  const limit = parseInt(req.query.limit || 14);
  let response;

  let populate;

  try {
    populate = JSON.parse(req.query.populate);
  } catch (error) {
    log("Couldn't parse populate query param");
    populate = false;
  }

  try {
    response = await fetchOne({ isActive: true }, populate, {
      skip,
      limit,
    });
  } catch (error) {
    return respond.success(res, 404, 'Current Calendar not found!', error);
  }

  if (response) {
    return respond.success(
      res,
      200,
      'Fetched current Calendar successfully! :)',
      response
    );
  } else {
    // This actually means that there is no Current Calendar! Thank you Jesus
    return respond.success(
      res,
      200,
      'No current Calendar Year! You can start a new one :) Thank you Jesus!',
      null
    );
  }
}

function getSkip(page: number, length: number) {
  return --page * length;
}

/**
 * End Calendar Year!
 * - Moves Clubs
 * - Updates Player ratings etc
 * - Updates Club ratings etc
 */
export async function endYear(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;

  const currentCalendar = await fetchOneById(id);

  if (!currentCalendar.isActive && currentCalendar.isEnded) {
    // Calendar must already be ended.

    return respond.fail(
      res,
      400,
      'Calendar is already ended!',
      currentCalendar
    );
  }

  const all_seasons: SeasonInterface[] = await fetchAllSeasons({
    Calendar: id,
  });

  // actually check if Calendar is not already ended :)

  const all_finished = all_seasons.every((s) => s.isFinished && s.isStarted);

  if (!(all_seasons.length > 0)) {
    return respond.fail(res, 400, 'Seasons in Calendar Year not found!');
  }

  if (all_finished) {
    // Means all seasons are over! Yay! Thank you Jesus!
    // You can tell the Client that the Year is Over!
    // Update Calendar!
    // await fin(season.Calendar, { allSeasonsCompleted: true });

    const t = all_seasons.map((s) => prolegate(s._id as string));

    Promise.all(t)
      .then((r) => {
        console.log('Seasons prolegated Successfully!');
        // No, time to update Calendar!
        // TODO: This should get Player of the Year etc... thank you Jesus!
        updateCalendar({ _id: id }, { isActive: false, isEnded: true })
          .then((c) => {
            console.log('Calendar Year Ended Successfully! :)');
            // Move to the Updating Players part...
            return next();
            // return respond.success(
            //   res,
            //   200,
            //   'Calendar Year Ended successfully!',
            //   c
            // );
          })
          .catch((e) => {
            console.error(e);
            return respond.fail(res, 400, 'Error prolegating Seasons!', e);
          });
      })
      .catch((err) => {
        console.error(err);
        console.log('Could not prolegate Seasons...');

        return respond.fail(res, 400, 'Error prolegating Seasons!', err);
      });
  } else {
    return respond.fail(res, 400, 'All Seasons in Year are not yet completed!');
  }
}
