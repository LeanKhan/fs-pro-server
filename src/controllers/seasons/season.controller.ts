//   const { month, year } = req.query;
//   const newYear = month.toUpperCase() + '-' + year;
import { Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchAll } from '../../controllers/seasons/season.service';
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
