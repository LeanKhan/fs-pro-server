import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  calculateClubsTotalRatings,
  addPlayerToClub,
  updateClubLeague,
  updateClub,
  updateClubsById,
  fetchAllClubs,
  fetchClubs,
} from '../controllers/clubs/club.service';
import respond from '../helpers/responseHandler';
import log from '../helpers/logger';
import { IClub } from '../interfaces/Club';

export const calculateClubRating: RequestHandler = (
  req: Request,
  res: Response
) => {
  calculateClubsTotalRatings(req.params.id)
    .then((ratings) => {
      // Now calculate the total Average rating...
      let total_rating;

      if (ratings.length !== 0) {
        total_rating = ratings.reduce((sum, { avg_rating }) => {
          return (sum += avg_rating);
        }, 0);
      }

      const attClass =
        (ratings.find((r) => r.position === 'ATT').avg_rating +
          ratings.find((r) => r.position === 'MID').avg_rating) /
        2;

      const defClass =
        (ratings.find((r) => r.position === 'GK').avg_rating +
          ratings.find((r) => r.position === 'DEF').avg_rating) /
        2;

      const avg_total_rating = total_rating ? total_rating / ratings.length : 0;

      const data: ClubRating = {
        Rating: avg_total_rating,
        AttackingClass: attClass,
        DefensiveClass: defClass,
      };

      ratings.forEach((rating, i) => {
        data[`${rating.position}_Rating`] = rating.avg_rating;
      });

      // Now update club...

      updateClub(req.params.id, data)
        .then((club) => {
          respond.success(
            res,
            200,
            req.query.remove
              ? 'Player removed from Club successfully'
              : 'Player added to Club successfully',
            club
          );
        })
        .catch((err) => {
          log(`Error updating Club Rating => ${err}`);
          respond.fail(res, 400, 'Error updating Club Rating', err);
        });
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Error updating Players and Clubs', err);
    });
};

export function updateAllClubsRating(req: Request, res: Response) {
  // now, update all the Clubs... becasue by now, all clubs should have updated Squads...
  const allClubs = () => {
    return fetchClubs({}, 'ClubCode');
  };

  const updClub = (club_id: string) => {
    return calculateClubsTotalRatings(club_id)
      .then((ratings) => {
        // Now calculate the total Average rating...
        let total_rating;

        if (ratings.length !== 0) {
          total_rating = ratings.reduce((sum, { avg_rating }) => {
            return (sum += avg_rating);
          }, 0);
        }

        const attClass =
          (ratings.find((r) => r.position === 'ATT').avg_rating +
            ratings.find((r) => r.position === 'MID').avg_rating) /
          2;

        const defClass =
          (ratings.find((r) => r.position === 'GK').avg_rating +
            ratings.find((r) => r.position === 'DEF').avg_rating) /
          2;

        const avg_total_rating = total_rating
          ? total_rating / ratings.length
          : 0;

        const data: ClubRating = {
          Rating: avg_total_rating,
          AttackingClass: attClass,
          DefensiveClass: defClass,
        };

        ratings.forEach((rating, _i) => {
          data[`${rating.position}_Rating`] = rating.avg_rating;
        });

        // Now update club...
        return updateClub(club_id, data);
      })
      .catch((err) => {
        throw err;
      });
  };

  const runAll = (clubs: IClub[]) => {
    const t = clubs.map((c) => updClub(c._id as string));

    return Promise.all(t);
  };

  allClubs()
    .then(runAll)
    .then((c) => {
      console.log('Clubs updated successfully! => ', c);
      respond.success(res, 200, 'Players and Clubs updated successfully!');
    })
    .catch((err) => {
      console.log('Error updating Clubs!');
      console.error(err);
      respond.fail(res, 400, 'Error fetching Club', err);
    });
}

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
  const { playerId } = req.body.data;

  let _response;

  if (req.query.remove) {
    _response = updateClub(req.params.id, {
      $pull: { Players: playerId },
    });
  } else {
    _response = updateClub(req.params.id, {
      $push: { Players: playerId },
    });
  }

  _response
    .then((club) => {
      req.body.club = club;

      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Club', err);
    });
}

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
