import {
  Request,
  Response,
  NextFunction,
  response,
  RequestHandler,
} from 'express';
import responseHandler from '../helpers/responseHandler';
import { addClub } from '../controllers/competitions/competition.service';

export async function addClubToCompetition (req: Request, res: Response, next: NextFunction) {
	 // tslint:disable-next-line: variable-name
  const _response = await addClub(req.params.league_id, req.body.clubId);

  if (!_response.error) {
    next();
  } else {
    responseHandler.fail(
      res,
      400,
      'Error adding club to competition',
      _response.result
    );
  }

}