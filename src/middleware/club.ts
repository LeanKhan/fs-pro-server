import {
  Request,
  Response,
  NextFunction,
  response,
  RequestHandler,
} from 'express';
import {
  calculateClubsTotalRatings,
  addPlayerToClub,
  updateClubLeague,
} from '../controllers/clubs/club.service';
import respond from '../helpers/responseHandler';

export const calculateClubRating: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // tslint:disable-next-line: variable-name
  const _response = await calculateClubsTotalRatings(req.params.id);

  if (!_response.error) {
    respond.success(res, 200, 'Player signed successfully!', _response.result);
  } else {
    respond.fail(res, 400, 'Error calculating club ratings');
  }
};

/**
  ---- yo ----
*/
export const addPlayerToClubMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // tslint:disable-next-line: variable-name
  const _response = await addPlayerToClub(req.params.id, req.body.playerId);

  if (!_response.error) {
    next();
  } else {
    respond.fail(res, 400, 'Error adding player to club', _response.result);
  }
};
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
