//   const { month, year } = req.query;
//   const newYear = month.toUpperCase() + '-' + year;
import { Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll,
  fetchSeason,
  findByIdAndUpdate,
} from '../../controllers/seasons/season.service';
import { SeasonInterface } from './season.model';
import { compileStandings } from '../../utils/seasons';
import { CompetitionInterface } from '../competitions/competition.model';
// import { monthFromIndex } from '../../utils/seasons';

export async function getCurrentSeasons(req: Request, res: Response) {
  /**
   * 1. Get the latest seasons of the Competitions involved ...
   * 2. Create Calendar Days by pushing Season fixtures to Calendar with maybe some free days inbetween..
   * 3. Let's gooo!
   * 4. Thank you Jesus...
   */

  const year = process.env.CURRENT_YEAR!.trim() || req.query.year;

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
  const query = { Year: year, isFinished: false, Status: 'started' };
  try {
    const seasons = await fetchAll(query, populate, false);
    if (seasons.length === 0) {
      return respond.fail(res, 404, 'No Seasons found!', seasons);
    }
    return respond.success(res, 200, 'Found seasons', seasons);
  } catch (error) {
    return respond.fail(res, 400, 'Failed to get seasons \n ' + error, error);
  }
}

// TODO: sort standings
// Should we sort when the season is being saved or when it is fetched?
// ------------ //
// sortStandings(standings_array) {
//   standings = standings_array.sort((a, b) => {
//     if (b.Points == a.Points) {
//       if (b.GD == b.GD) {
//         return b.GF - a.GF;
//       } else {
//         b.GD - a.GD;
//       }
//     } else {
//       return b.Points - a.Points;
//     }
//   });
//   log(standings);
//   view.displayStandings(standings);
// }

export async function finishSeason(req: Request, res: Response) {
  // do stuff...
  // To get the last match of the season, we should check the Season and
  // fetch the Fixtures, then get the last element in the Fixtures array.
  // Then we compare it's Day to the Day of the Current Match...
  // o tan... thank you Jesus!
  // ----- //
  // or we could just add a check in fixtures and if it passes we know this fixture is the last season, but we
  // also need to check if the other seasons are finished...
  // so fetch the season, not the fixture. plus populate

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
    const q = { _id: season_id, isStarted: true, isFinished: false };
    // get fixture and its details...
    // tho, part of the query should be the year. Year should be the CurrentYear
    season = await fetchSeason(
      q,
      'SeasonID SeasonCode Competition Standings',
      true
    );
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

    // now do what you want with the season...
    /**
     * We need to:
     * - Update Player Stats [nah, at the end of the year?]
     * - Mark promoted and relegated... so that at the end of the year, we can put them in their place!
     * - Mark another thing like Competitions to play and all
     * - Get Player of the Year (season), Manager of the Year (?), Get Starting XI of the year [could be at the end of the year?]
     * - Send all of this to the client...
     *
     * The most important pieces of information are:
     - Who won?
     - Who is getting promoted (if applicable)
     - Who is getting relegated
     - Who is the player of the year
     - Who is manager of the year [not urgent]
     - What prizes were won, if any... [not urgent]
      Thank you Jesus!
  
      Generate all this into a report and save it, then send it to client.
     */

    // To find who won, just find who is at the top of the table

    const standings = compileStandings(season.Standings);
    const cmp = season.Competition as CompetitionInterface;
    let prolegated;

    if (cmp.Division == 1 && cmp.League) {
      // find the last two clubs on compiled table...
      const p = [
        standings[standings.length - 2].ClubID,
        standings[standings.length - 1].ClubID,
      ];

      // g should look like: ['3efcieurgiejrv', '5sfusdjifevw']

      prolegated = {
        Relegated: p,
      };
    } else if (cmp.Division == 2 && cmp.League) {
      // the first two clubs on the compiled table...
      const p = [standings[0].ClubID, standings[1].ClubID];

      // const g = p.map(c => cmp.Clubs.find(f => c.ClubID == f));

      // p should look like: ['3efcieurgiejrv', '5sfusdjifevw']

      prolegated = {
        Promoted: p,
      };
    }

    // nOW THE Season has been confirmed to be over... Update it!
    findByIdAndUpdate(season_id, {
      isStarted: true,
      isFinished: true,
      $push: {
        Log: {
          title: `Season finished`,
          content: 'Season finished!',
          date: new Date(),
        },
      },
      $set: prolegated,
    })
      .then((season: any) => {
        console.log('Season has been updated successfully!');
      })
      .catch((err: any) => {
        respond.fail(res, 400, 'Error starting Season', err);
      });

    return respond.success(res, 200, 'Found Standings', standings);
  } catch (error) {
    console.error(error);
    return respond.fail(res, 400, 'Error doing something', error);
  }
}
