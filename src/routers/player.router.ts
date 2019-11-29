import express from 'express';
import respond from '../helpers/responseHandler';
import { fetchAllPlayers, createNewPlayer } from '../services/player.service';

const router = express.Router();

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
router.post('/new', async (req, res) => {
  const response = await createNewPlayer(req.body);

  // TODO:
  // Calculate the things that need to be calculated before you save the player in the db
  // probably make some middleware to do some validations and then some calculations...

  if (!response.error) {
    respond.success(res, 200, 'Player created successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error creating player', response.result);
  }
});

export default router;
