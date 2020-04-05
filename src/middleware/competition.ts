import { Request, Response, NextFunction } from 'express';
import respond from '../helpers/responseHandler';
import {
  addClub,
  addSeason,
} from '../controllers/competitions/competition.service';

export async function addClubToCompetition(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // tslint:disable-next-line: variable-name
  const response = addClub(req.params.league_id, req.body.clubId);

  response
    .then((data) => {
      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error adding Club to Competition', err);
    });
}

export function addSeasonToCompetition(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const response = addSeason(req.body.data.Competition, req.body.seasonMongoID);

  response
    .then((seasons) => {
      respond.success(res, 200, 'Season added to competition successfully!');
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error adding sesason to competition', err);
    });
}
