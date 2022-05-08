import respond from '../../helpers/responseHandler';
import { NextFunction, Request, Response } from 'express';
import { ManagerInterface } from '../managers/manager.model';
import { updateById, fetchOneById } from '../managers/manager.service';
import { update as updateCompetition } from '../competitions/competition.service';
import {
  createMany,
  fetchSingleClubById,
  updateClub,
  updateClubsById,
} from './club.service';
import log from '../../helpers/logger';
import { readCSVFileAsync, readCSVFileUploadAsync } from '../../utils/csv';
import multer from 'multer';
import { addClubsToUser } from '../user/user.service';

export const upload_csv = multer({ dest: 'tmp/csv/' });

export function updateClubs(req: Request, res: Response, next: NextFunction) {
  const { clubs, userID } = req.body;
  updateClubsById(clubs, { User: userID })
    .then((cl: any) => {
      return next();
    })
    .catch((err: any) => {
      return respond.fail(res, 400, 'Error adding User to club', err);
    });
}

export function addManagerToClub(req: Request, res: Response) {
  // Clubs must fire current managers before they can hire a new one!

  const { id: club_id } = req.params;
  const { manager, details } = req.body;

  // Fetch Manager first and even confirm if they exist!

  const fetchManager = () => {
    return fetchOneById(manager);
  };

  // Club should not already have a manager!

  const getClubData = (m: ManagerInterface) => {
    if (!m) {
      throw new Error('Manager does not exist!');
    }

    return fetchSingleClubById(club_id, false)
      .then((club) => {
        if (club.Manager) {
          // club already has a manager, kill it off!
          return respond.fail(
            res,
            401,
            'Club already has a manager. Remove manager before you can hire a new one'
          );
        }

        return {
          $set: {
            isEmployed: true,
            Club: club._id,
          },
          $push: {
            Records: {
              type: 'hired',
              title: `${m.FirstName} ${m.LastName} joined ${club.Name} as their new manager`,
              date: new Date(),
              details,
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
        Records: {
          type: 'manager-hire',
          title: `Hired ${m.FirstName} ${m.LastName} as new manager!`,
          date: new Date(),
          details,
          manager: m._id,
        },
      },
    });
  };

  fetchManager()
    .then(getClubData)
    .then(updateManager)
    .then(_updateClub)
    .then((c) => {
      log('Hired New Manager!');
      return respond.success(res, 200, 'Hired new manager successfully!');
    })
    .catch((err) => {
      log('Error hiring new manager!');
      return respond.fail(res, 400, 'Error hiring new manager!', err);
    });
}

export function removeManagerFromClub(req: Request, res: Response) {
  const { id } = req.params;
  const details = req.query.reason || '';

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
                type: 'manager-leaving',
                title: `Left ${club.Name} as their new manager.`,
                date: new Date(),
                club: club._id,
                details,
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
        Records: {
          type: 'manager-leaving',
          title: `Manager ${m.FirstName} ${m.LastName} left the club`,
          date: new Date(),
          manager: m._id,
          details,
        },
      },
    });
  };

  getClubData()
    .then(updateManager)
    .then(_updateClub)
    .then((c) => {
      log('Removed Manager');
      return respond.success(res, 200, 'Removed Manager successfully!');
    })
    .catch((err) => {
      log('Error removing Manager!');
      return respond.fail(res, 400, 'Error removing Manager!', err);
    });
}

// TODO: add Manager, League, LeagueCcode, Players
// Rating and the Position Ratings

const groupBy = function (data, key) {
  return data.reduce(function (storage, item) {
    const group = item[key];

    storage[group] = storage[group] || [];

    storage[group].push(item);

    return storage;
  }, {});
};

/**
 * This function is meant to create many clubs from a list of clubs
 * It requires that you pass a csv filename saved in files directory
 * as a 'filename' query param.
 *
 */
export async function createManyClubsFromCSV(req: Request, res: Response) {

  let data: { data: any[]; rowCount: number } = [];

  // const saveClubsInCompetition = (competition_id: string, club_ids: string[]) => {
  //   return updateCompetition(competition_id, { $addToSet: { Clubs: {$each: club_ids} } });
  // };

  // REFACTOR: turn into resuable function
  const saveClubsInCompetition = (clubs: IClub[]) => {
    const competition_clubs = groupBy(clubs, 'League');

    const all_club_ids = {};

    const promise_array = [];

    for (const u of Object.keys(competition_clubs)) {
      all_club_ids[u] = competition_clubs[u].map((i) => i._id);
    }

    for (const k of Object.keys(all_club_ids)) {
      promise_array.push(updateCompetition(k, { $addToSet: { Clubs: {$each: all_club_ids[k]} } }));
    }

    return Promise.all(promise_array);
  };

  const saveClubsInUser = (clubs: IClub[]) => {
    const user_clubs = groupBy(clubs, 'User');

    const all_club_ids = {};

    const promise_array = [];

    for (const u of Object.keys(user_clubs)) {
      all_club_ids[u] = user_clubs[u].map((i) => i._id);
    }

    for (const u of Object.keys(all_club_ids)) {
      promise_array.push(addClubsToUser(u, all_club_ids[u]));
    }

    return Promise.all(promise_array);
  };

  try {
    data = await readCSVFileUploadAsync(req.file.path);
    // let club_ids = [];
    // the next thing for this would be to use the
    // generated objects to create Mongoose records
    let club_ids = [];
    let created_clubs = [];
    createMany(data.data)
    .then((clubs: any) => {
      // get ids...
      club_ids = clubs.map((club: any) => club._id);
      created_clubs = clubs;
      return  Promise.all[saveClubsInUser(clubs), saveClubsInCompetition(clubs)]
      // return clubs;
    })
    // .then(saveClubsInUser)
    .then((c: any) => {
      console.log('Updated Users and  Clubs => ', c);
      return club_ids;
    })
    // .then(saveClubsInCompetition)
    .then((comp: any) => {

      log('Clubs created successfully from upload');
      return respond.success(res, 200, 'Clubs created and Competition updated successfully!', created_clubs);
    })
    .catch((err: any) => {
      console.error(err);
      console.log('Failed to create Clubs and update Competition!', err);
      return respond.fail(res, 400, 'Failed to add Days to Calendar', err);
    });

  } catch (err) {
    console.error('ERROR READING CSV ', err);
    return respond.fail(res, 400, 'Error reading CSV File', err.toString());
  }
}
