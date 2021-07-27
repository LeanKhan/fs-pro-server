import { Request, Response, NextFunction } from 'express';
import respond from '../../helpers/responseHandler';
import {
  update,
  addSeason,
} from '../../controllers/competitions/competition.service';
import { updateClub } from '../clubs/club.service';
import { CompetitionInterface } from './competition.model';

export function addClubToCompetition(req: Request, res: Response) {
  const { id } = req.params;
  const { clubId: club, leagueCode } = req.body;

  if(!club) {
    return respond.fail(res, 400, 'No Club sent to add!');
  }

  // check if the club already in the Competition kini

  const up = {
    $addToSet: { Clubs: club }, // only add unique items...
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
