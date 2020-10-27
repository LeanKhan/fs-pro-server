import respond from '../../helpers/responseHandler';
import { NextFunction, Request, Response } from 'express';
import { ManagerInterface } from '../managers/manager.model';
import { updateById } from '../managers/manager.service';
import {
  fetchSingleClubById,
  updateClub,
  updateClubsById,
} from './club.service';

export async function updateClubs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { clubs, userID } = req.body;
  updateClubsById(clubs, { User: userID })
    .then((cl) => {
      next();
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error adding User to club', err);
    });
}

export function addManagerToClub(req: Request, res: Response) {
  // Get the manager's id and save it to Club kini. But also
  // edit the manager...

  const { id: club_id } = req.params;
  const { manager } = req.body;

  const getClubData = () => {
    return fetchSingleClubById(club_id, false)
      .then((club) => {
        return {
          $set: {
            isEmployed: true,
            Club: club._id,
          },
          $push: {
            Records: {
              message: `Joined ${club.Name} as their new manager`,
              date: new Date(),
              club: club._id,
            },
          },
        };
      })
      .catch((err) => {
        throw err;
      });
  };

  // TODO: make all this record more information in 'Records'

  const updateManager = (update: any) => {
    return updateById(manager, update);
  };

  const _updateClub = (m: ManagerInterface) => {
    return updateClub(club_id, {
      Manager: m._id,
      $push: {
        Records: `Hired ${m.FirstName} ${m.LastName} [${m.Key}] as new manager!`,
      },
    });
  };

  getClubData()
    .then(updateManager)
    .then(_updateClub)
    .then((c) => {
      console.log('Hired New Manager!');
      return respond.success(res, 200, 'Hired new manager successfully!');
    })
    .catch((err) => {
      console.log('Error hiring new manager!');
      return respond.fail(res, 400, 'Error hiring new manager!', err);
    });
}

export function removeManagerFromClub(req: Request, res: Response) {
  const { id } = req.params;
  const reason = req.body.reason || '';

  const getClubData = () => {
    return fetchSingleClubById(id, false)
      .then((club) => {
        return {
          update: {
            $set: {
              isEmployed: false,
            },
            $unset: {
              Club: 1,
            },
            $push: {
              Records: {
                message: `Left ${club.Name} as their new manager.`,
                date: new Date(),
                club: club._id,
                reason,
              },
            },
          },
          manager: club.Manager,
        };
      })
      .catch((err) => {
        throw err;
      });
  };

  const updateManager = (data: any) => {
    return updateById(data.manager, data.update);
  };

  const _updateClub = (m: ManagerInterface) => {
    return updateClub(id, {
      $unset: { Manager: 1 },
      $push: {
        Records: `${m.FirstName} ${m.LastName} [${m.Key}] has left the Club!`,
      },
    });
  };

  getClubData()
    .then(updateManager)
    .then(_updateClub)
    .then((c) => {
      console.log('Removed Manager');
      return respond.success(res, 200, 'Removed Manager successfully!');
    })
    .catch((err) => {
      console.log('Error removing Manager!');
      return respond.fail(res, 400, 'Error removing Manager!', err);
    });
}
