import express from 'express';
import playerModel, { IPlayerModel } from '../models/player.model';
import { fetchAllPlayers, createNewPlayer } from '@/services/player.service';
import respond from '@/helpers/responseHandler';

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
 */
router.post('/new', async (req, res) => {
  const response = await createNewPlayer(req.body);

  if (!response.error) {
    respond.success(res, 200, 'Player created successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error creating player', response.result);
  }
});

export default router;
