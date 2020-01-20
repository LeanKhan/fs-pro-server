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
} from '../services/club.service';
import responseHandler from '../helpers/responseHandler';

export const calculateClubRating: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // tslint:disable-next-line: variable-name
  const _response = await calculateClubsTotalRatings(req.params.id);

  if (!_response.error) {
    responseHandler.success(
      res,
      200,
      'Player signed successfully!',
      _response.result
    );
  } else {
    responseHandler.fail(res, 400, 'Error calculating club ratings');
  }
};

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
    responseHandler.fail(
      res,
      400,
      'Error adding player to club',
      _response.result
    );
  }
};
