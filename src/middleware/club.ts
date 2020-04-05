import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  calculateClubsTotalRatings,
  addPlayerToClub,
  updateClubLeague,
  updateClub,
} from '../controllers/clubs/club.service';
import respond from '../helpers/responseHandler';

export const calculateClubRating: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _response = calculateClubsTotalRatings(req.params.id);

  _response
    .then((ratings) => {
      // Now calculate the total Average rating...
      const total_rating = ratings.reduce((sum, { avg_rating }) => {
        return (sum += avg_rating);
      }, 0);

      const avg_total_rating = total_rating / ratings.length;

      const data: ClubRating = {
        Rating: avg_total_rating,
      };

      ratings.forEach((rating, i) => {
        data[`${rating.position}_Rating`] = rating.avg_rating;
      });

      // Now update club...

      updateClub(req.params.id, data).then((club) => {
        respond.success(res, 200, 'Player added to Club successfully', club);
      });
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Club', err);
    });
};

interface ClubRating {
  Rating: number;
  [key: string]: any;
}

export function addPlayerToClubMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // tslint:disable-next-line: variable-name
  const { playerId } = req.body;
  const _response = updateClub(req.params.id, {
    $push: { Players: playerId },
  });

  _response
    .then((club) => {
      req.body.club = club;

      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Club', err);
    });
}
// TODO: use a uniform naming convention, ugh :)
// TODO: change the name of this function <<thumbs>>
export async function addLeagueToClub(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const _response = await updateClubLeague(
    req.body.clubId,
    req.body.leagueCode,
    req.params.league_id
  );

  if (!_response.error) {
    respond.success(
      res,
      200,
      'Club added to competition successfully!',
      _response.result
    );
  } else {
    respond.fail(res, 400, 'Error adding player to club', _response.result);
  }
}
