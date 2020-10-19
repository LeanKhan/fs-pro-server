import { Request, Response, NextFunction } from 'express';
import respond from '../../helpers/responseHandler';
import {
  update,
  addSeason,
} from '../../controllers/competitions/competition.service';
import { updateClub } from '../clubs/club.service';
import { CompetitionInterface } from './competition.model';

export async function addClubToCompetition(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { club } = req.body;

  const up = {
    $push: { Clubs: club },
  };

  const addClub = () => {
    return update(id, up);
  };

  const addCompetitionToClub = (comp: CompetitionInterface) => {
    const up2 = {
      $set: { LeagueCode: comp.CompetitionCode, League: comp._id },
    };

    return updateClub(club, up2);
  };

  addClub()
    .then(addCompetitionToClub)
    .then(() => {
      respond.success(
        res,
        200,
        'Club has been added to Competition successfully!'
      );
      // Thank you Jesus
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
  addSeason(req.body.data.Competition, req.body.seasonMongoID)
    .then(() => {
      respond.success(res, 200, 'Season added to competition successfully!');
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error adding sesason to competition', err);
    });
}
