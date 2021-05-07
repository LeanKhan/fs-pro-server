import { Router } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll,
  createNewPlayer,
  fetchOneById,
  updateById,
  deletePlayer,
  updatePlayers,
} from './player.service';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';
import { fetchAppearance } from '../../utils/appearance';
import log from '../../helpers/logger';

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
  }

  fetchAll(options)
    .then((players: any) => {
      respond.success(res, 200, 'Players fetched successfully', players);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching players', err);
    });
});

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

/** Delete Player by id */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  deletePlayer(id)
    .then((player: any) => {
      respond.success(res, 200, 'Player deleted successfully', player);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error deleting Player', err);
    });
});

/**
 * Create new player
 * Format to create new player
 */
router.post('/new', getCurrentCounter, async (req, res) => {
  const response = await createNewPlayer(req.body.data);

  if (!response.error) {
    respond.success(res, 200, 'Player created successfully', response.result);
    void incrementCounter('player_counter');
  } else {
    respond.fail(res, 400, 'Error creating player', response.result);
  }
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

export default router;
