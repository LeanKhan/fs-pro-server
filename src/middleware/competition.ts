import { Request, Response, NextFunction } from 'express';
import respond from '../helpers/responseHandler';
import { addClub, addSeason } from '../controllers/competitions/competition.service';

export async function addClubToCompetition(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // tslint:disable-next-line: variable-name
  const _response = await addClub(req.params.league_id, req.body.clubId);

  if (!_response.error) {
    next();
  } else {
    respond.fail(
      res,
      400,
      'Error adding club to competition',
      _response.result
    );
  }
}

export async function addSeasonToCompetition(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const _response = await addSeason(
    req.body.data.Competition,
    req.body.seasonID,
  );

  if (!_response.error) {
    respond.success(
      res,
      200,
      'Season added to competition successfully!',
      _response.result
    );
  } else {
    respond.fail(res, 400, 'Error adding sesason to competition', _response.result);
  }
}

