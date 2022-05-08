/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, Router } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll,
  createNewPlayer,
  fetchOneById,
  updateById,
  deletePlayer,
  deleteByRemove,
  updatePlayers,
  getSpecificPlayerStats,
  findOnePlayer,
} from './player.service';
import { PlayerInterface } from './player.model';
import { generatePlayers } from './player.controller';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';
import {
  calculatePlayerRating,
  calculatePlayerValue,
} from '../../utils/players';
import { fetchAppearance } from '../../utils/appearance';
import { runSpawn } from '../../utils/scripts';
import log from '../../helpers/logger';
import { baseQuery, setupRoutes } from '../../helpers/queries';
import { titleCase } from '../../helpers/misc';
import { Types } from 'mongoose';
import { fetchAllClubs, fetchClubs } from '../clubs/club.service';

const router = Router();

/**
 * Fetch all Players
 */
router.get('/all', (req, res) => {
  let options = req.query.options || {};
  // This prevents the app from crashing if there's
  // an error parsing object :)
  try {
    if (req.query.options) {
      options = JSON.parse(req.query.options);
    }
  } catch (err) {
    log(`Error parsing JSON => ${err}`);
      return respond.fail(res, 400, 'Error fetching players: Parsing Options', err.toString());
  }

  fetchAll(options)
    .then((players: any) => {
      return respond.success(res, 200, 'Players fetched successfully', players);
    })
    .catch((err: any) => {
      return respond.fail(res, 400, 'Error fetching players', err.toString());
    });
});

// router.get('/club', (req, res) => {
//   let options = req.query.options || {};
//   // This prevents the app from crashing if there's
//   // an error parsing object :)
//   try {
//     if (req.query.options) {
//       options = JSON.parse(req.query.options);
//     }
//   } catch (err) {
//     log(`Error parsing JSON => ${err}`);
//   }

//   fetchAll(options)
//     .then((players: any) => {
//       respond.success(res, 200, 'Players fetched successfully', players);
//     })
//     .catch((err: any) => {
//       respond.fail(res, 400, 'Error fetching players', err);
//     });
// });

/**
 * Update a Player
 */
router.post('/:id/update', (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  updateById(id, data)
    .then((player: any) => {
      respond.success(res, 200, 'Player updated successfully', player);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error updating Player', err);
    });
});

/**
 * Create new player
 * Format to create new player
 */
router.post('/new', getCurrentCounter, async (req, res) => {
  const player = req.body.data as PlayerInterface;
  // const player_rating = calculatePlayerRating(req.body.data.Attributes, req.body.data.Position);
  const new_rating = Math.round(
    calculatePlayerRating(player.Attributes, player.Position, player.Role)
  );

  const new_value = calculatePlayerValue(
    req.body.data.Position,
    new_rating,
    req.body.data.Age
  );

  const response = await createNewPlayer({
    ...req.body.data,
    Rating: new_rating,
    Value: new_value,
  });

  if (!response.error) {
    respond.success(res, 200, 'Player created successfully', response.result);
    void incrementCounter('player_counter');
  } else {
    respond.fail(res, 400, 'Error creating player', response.result);
  }
});

router.get('/:id/rating', async (req, res) => {
  const { id } = req.params;

  const player = (await fetchOneById(id)) as PlayerInterface;

  if (!player) return respond.fail(res, 400, 'Player not found!');

  // const player_rating = calculatePlayerRating(req.body.data.Attributes, req.body.data.Position);
  const new_rating = Math.round(
    calculatePlayerRating(player.Attributes, player.Position, player.Role)
  );

  const new_value = calculatePlayerValue(
    player.Position,
    new_rating,
    player.Age
  );

  return respond.success(res, 200, 'Player Rating and Value successfully', {
    new_rating,
    new_value,
  });
});

router.get('/appearance', (req, res) => {
  fetchAppearance()
    .then((features) => {
      respond.success(res, 200, 'Fetched Appearance successfully', features);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching appearance features', err);
    });
});

router.patch('/update-many', (req, res) => {
  const { update, query } = req.body;

  if (!update || !query)
    return respond.fail(res, 400, 'Please provide a Query or Update !');

  updatePlayers(query, update)
    .then((updated: any) => {
      respond.success(res, 200, 'Updated many players successfully!', updated);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error updating many players', err);
    });
});

/**
 * Use like this -> {{url}}/players/stats?match_k=season.CompetitionCode&match_v=EFL&sort_k=goals&sort_v=-1
 */
router.get('/stats', async (req: Request, res: Response) => {
  const { match_k, sort_k, match_v, sort_v } = req.query;

  const matchObject: { [key: string]: any } = {};
  const sortObject: { [key: string]: any } = {};

  matchObject[match_k] = match_v;

  try {
    sortObject[sort_k] = parseInt(sort_v);
    if (Types.ObjectId(match_v)) {
      matchObject[match_k] = Types.ObjectId(match_v);
    }
  } catch (error) {
    console.error(error);
  }

  await getSpecificPlayerStats(matchObject, sortObject)
    .then((updated: any) => {
      // get only the top 5
      return respond.success(
        res,
        200,
        `The Best 5 Players by ${sort_k.toUpperCase()}`,
        updated.slice(0, 5)
      );
    })
    .catch((err: any) => {
      return respond.fail(res, 400, 'Error fetching Player stats', err);
    });
});

router.put('/works/add-roles', (req, res) => {
  const { id } = req.params;

  fetchOneById(id)
    .then((player: any) => {
      respond.success(res, 200, 'Player fetched successfully', player);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Player', err);
    });
});

router.get('/generate-players', generatePlayers);

// router.post('/add-clubcodes', async (req, res) => {
//   const all_clubs = await fetchClubs({}, 'ClubCode');

//   const po = all_clubs.map((c) => {
//     return updatePlayers({ ClubCode: c.ClubCode }, { Club: c._id });
//   });

//   Promise.all(po)
//     .then((players: any) => {
//       respond.success(res, 200, 'Players updated successfully', players);
//     })
//     .catch((err: any) => {
//       respond.fail(res, 400, 'Error updating Players', err);
//     });
// });

/**
 * fetch one Player
 */

router.get('/:id', (req, res) => {
  const { id } = req.params;

  fetchOneById(id)
    .then((player: any) => {
      respond.success(res, 200, 'Player fetched successfully', player);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Player', err);
    });
});

/** Delete Player by id */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  deleteByRemove(id)
    .then((player: any) => {
      respond.success(res, 200, 'Player deleted successfully', player);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error deleting Player => ', err.toString());
    });
});

setupRoutes(router, 'Player');

export default router;
