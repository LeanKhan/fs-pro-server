/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//   const { month, year } = req.query;
//   const newYear = month.toUpperCase() + '-' + year;
import { NextFunction, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll,
  fetchOneById,
  fetchSeason,
  findByIdAndUpdate,
} from '../../controllers/seasons/season.service';
import { SeasonInterface } from './season.model';
import { compileStandings } from '../../utils/seasons';
import { CompetitionInterface } from '../competitions/competition.model';
import { findOneAndUpdate } from '../calendar/calendar.service';
import { findOne, update } from '../competitions/competition.service';
import { updateClub } from '../clubs/club.service';
// import { monthFromIndex } from '../../utils/seasons';

export async function getCurrentSeasons(req: Request, res: Response) {
  /**
   * 1. Get the latest seasons of the Competitions involved ...
   * 2. Create Calendar Days by pushing Season fixtures to Calendar with maybe some free days inbetween..
   * 3. Let's gooo!
   * 4. Thank you Jesus...
   */

  const year = req.params.year;

  let populate;

  try {
    populate = JSON.parse(req.query.populate);
  } catch (error) {
    console.log("Couldn't parse populate query param for Seasons");
    populate = false;
  }

  // now find the seasons with these parameters [${compCode}-${Month}-${Year}]
  // const seasons = findAll
  // Find the seasons that are in these competitions and this year
  const query = { Year: year };
  try {
    const seasons = await fetchAll(query, populate, false);
    if (seasons.length == 0) {
      return respond.fail(res, 404, 'No Seasons found!', seasons);
    }
    return respond.success(res, 200, 'Found seasons', seasons);
  } catch (error) {
    return respond.fail(res, 400, 'Failed to get seasons \n ' + error, error);
  }
}

/**
 * Finish Season!
 * @param req
 * @param res
 * @returns
 */
export async function finishSeason(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id: season_id } = req.params;

  if (!season_id) {
    // SEND IT BACK!
    return respond.fail(res, 404, 'No Season ID sent! Cannot end season...', {
      matchErrorResponseCode: 1,
    });
  }

  let season: SeasonInterface;

  // season.Competition maybe find the competition and do the needful...

  try {
    // TODO: IMPORTANT (!) REVERT THIS O! THANK YOU JESUS!
    const q = { _id: season_id, isStarted: true };
    // const q = { _id: season_id, isStarted: true, isFinished: false };
    // get fixture and its details...
    // tho, part of the query should be the year. Year should be the CurrentYear
    season = await fetchSeason(q, false, 'Competition Fixtures');
    // We also need to get the associated calendar day...
  } catch (error) {
    console.log(`Error! => ${error}`);

    return respond.fail(
      res,
      400,
      'Error ending Season, could not fetch Season',
      {
        ...error,
        matchErrorResponseCode: 1,
      }
    );
  }

  if (!season) {
    /**
     * This means:
     * - Id is wrong,
     * - Season is not started yet, therefore cannot be ended,
     * - Season is already finished...
     */
    return respond.fail(
      res,
      404,
      'Either, Id is wrong, Season is not started yet or is already finished',
      {
        seasonErrorResponseCode: '404 - Season not found',
      }
    );
  }

  // Now do the things...
  // check if all the matches have actually been played
  try {
    if (!season.Fixtures.every((f) => f.Played)) {
      return respond.fail(
        res,
        404,
        'Not all Fixtures have been played yet! :7',
        {
          seasonErrorResponseCode:
            '400 - Not all matches in Season have been played! ',
        }
      );
    }

    const standings = compileStandings(season.Standings);
    const cmp = season.Competition as CompetitionInterface;
    // TODO: Do Best Player etc...

    const updateSeason = () => {
      const prolegated: any =
        cmp.Division == 1 && cmp.League
          ? {
              Relegated: standings
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .slice(standings.length - cmp.TeamsRelegated!)
                .map((s) => s.ClubID),
            }
          : {
              Promoted: standings
                .slice(0, cmp.TeamsPromoted)
                .map((s) => s.ClubID),
            };

      req.body.seasonChampions = standings[0].ClubID;

      return findByIdAndUpdate(season_id, {
        isStarted: true,
        isFinished: true,
        Status: 'finished',
        EndDate: new Date(),
        Winner: standings[0].ClubID, // Winner of the League
        $push: {
          Logs: [
            {
              title: `Season finished`,
              content: 'Season finished!',
              date: new Date(),
            },
          ],
        },
        $set: prolegated,
      });
    };

    const checkOtherSeasons = async (season: SeasonInterface) => {
      // Find all seasons in the year
      const all_seasons: SeasonInterface[] = await fetchAll({
        Calendar: season.Calendar,
        Year: season.Year,
      });

      const all_finished = all_seasons.every(
        (s) => s.isFinished && s.isStarted
      );

      if (all_finished) {
        await findOneAndUpdate(
          { _id: season.Calendar },
          { allSeasonsCompleted: true }
        );
      }

      return season;
    };

    updateSeason()
      .then(checkOtherSeasons)
      .then((updatedSeason: any) => {
        req.body.updatedSeason = updatedSeason;
        req.body.standings = standings;
        return next();
        // return respond.success(res, 200, 'Season Ended Successfully!', {
        //   // this should also have the Season object to send back to the Client...
        //   standings,
        //   season: updatedSeason
        // });
      })
      .catch((err) => {
        console.error(err);
        console.log('Error ending Season!');

        return respond.fail(res, 400, 'Error ending Season!', err);
      });
  } catch (error) {
    console.error(error);
    return respond.fail(res, 400, 'Error doing something', error);
  }
}

/**
 * Prolegate: (Pro)mote or Re(legate)
 *
 * This function promotes or relegates the clubs in the Season...
 * Thank you Jesus
 * @param season_id
 * @returns
 */
export async function prolegate(season_id: string) {
  const season: SeasonInterface = await fetchOneById(
    season_id,
    '-Fixtures',
    'Competition'
  );

  const moveClub = async (
    club_id: string,
    old_comp: CompetitionInterface,
    type: 'up' | 'down'
  ) => {
    let diff: number;

    console.log('Inside MoveClub');

    switch (type) {
      case 'up':
        diff = -1;
        console.log('Promoting Club...', club_id);
        break;
      case 'down':
        diff = 1;
        // adding becasue the lower leagues have higher division numbers i.e
        // League 1 is higher than League 2
        console.log('Relegating Club...', club_id);
    }

    // find the new Competition that is higher than current comp but
    // in the same country.
    const new_comp: CompetitionInterface = await findOne({
      Division: old_comp.Division + diff,
      Country: old_comp.Country
    });

    const record_msg = `Got ${type == 'up' ? 'Promoted' : 'Relegated'} to ${
      new_comp.Name
    }`;

    try {
      //  Remove from old... add to new
      await update(old_comp._id as string, { $pull: { Clubs: club_id } });

      await update(new_comp._id as string, { $push: { Clubs: club_id } });

      // update Club also..
      await updateClub(club_id, {
        League: new_comp._id,
        LeagueCode: new_comp.CompetitionCode,
        $push: {
          Records: {
            title: 'League Movement',
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            data: `From (${old_comp.Name}) ${old_comp._id} to (${new_comp.Name}) ${new_comp._id}`,
            content: record_msg,
            date: new Date(),
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const cmp = season.Competition as CompetitionInterface;
  let move_type: 'up' | 'down';
  switch (cmp.Division) {
    case 1:
      move_type = 'down';

      return Promise.all(
        season.Relegated.map((c) => moveClub(c, cmp, move_type))
      );
    case 2:
      move_type = 'up';

      return Promise.all(
        season.Promoted.map((c) => moveClub(c, cmp, move_type))
      );
  }
}
