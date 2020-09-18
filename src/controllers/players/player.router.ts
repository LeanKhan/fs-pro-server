import { Router } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAll,
  createNewPlayer,
  fetchOneById,
  updateById,
  deletePlayer,
} from './player.service';
import { getCurrentCounter } from '../../middleware/player';
import { incrementCounter } from '../../utils/counter';
import { fetchAppearance } from '../../utils/appearance';

const router = Router();

/**
 * Fetch all Players
 */
router.get('/all', async (req, res) => {
  let options = req.query.options || {};
  // This prevents the app from crashing if there's
  // an error parsing object :)
  try {
    if (req.query.options) {
      options = JSON.parse(req.query.options);
    }
  } catch (err) {
    console.log('Error parsing JSON => ', err);
  }

  const response = fetchAll(options);

  response
    .then((players) => {
      respond.success(res, 200, 'Players fetched successfully', players);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching players', err);
    });
});

/**
 * fetch one Player
 */

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const response = fetchOneById(id);

  response
    .then((player) => {
      respond.success(res, 200, 'Player fetched successfully', player);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Player', err);
    });
});

/**
 * Update a Player
 */
router.post('/:id/update', (req, res) => {
  const id = req.params.id;
  const { data } = req.body;
  const response = updateById(id, data);

  response
    .then((player) => {
      respond.success(res, 200, 'Player updated successfully', player);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error updating Player', err);
    });
});

/** Delete Player by id */
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  const response = deletePlayer(id);

  response
    .then((player) => {
      respond.success(res, 200, 'Player deleted successfully', player);
    })
    .catch((err) => {
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
    incrementCounter('player_counter');
  } else {
    respond.fail(res, 400, 'Error creating player', response.result);
  }
});

router.get('/appearance', async (req, res) => {
  const response = fetchAppearance();

  response
    .then((features) => {
      respond.success(res, 200, 'Fetch Appearance successfully', features);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching appearance features', err);
    });
});

export default router;
