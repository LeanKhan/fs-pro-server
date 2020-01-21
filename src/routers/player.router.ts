import { Router } from 'express';
import respond from '../helpers/responseHandler';
import { fetchAllPlayers, createNewPlayer } from '../services/player.service';
import { getCurrentCounter } from '../middleware/player';
import { incrementCounter } from '../utils/counter';

const router = Router();

/**
 * Fetch all players
 */
router.get('/all', async (req, res) => {
  const response = await fetchAllPlayers();

  if (!response.error) {
    respond.success(res, 200, 'Players fetched successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error fetching players', response.result);
  }
});

/**
 * Create new player
 * Format to create new player
 *
 * {
 *  data: {
 *
 *  }
 * }
 *
 */
router.post('/new', getCurrentCounter, async (req, res) => {
  const response = await createNewPlayer(req.body);

  if (!response.error) {
    respond.success(res, 200, 'Player created successfully', response.result);
    incrementCounter('player_counter');
  } else {
    respond.fail(res, 400, 'Error creating player', response.result);
  }
});

export default router;
