import express from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAllClubs,
  createNewClub,
  fetchSingleClubById,
} from './club.service';
import { updatePlayerSigning } from '../../middleware/player';
import {
  addPlayerToClubMiddleware,
  calculateClubRating,
} from '../../middleware/club';

const router = express.Router();

// Get all clubs bro
router.get('/all', async (req, res) => {
  const response = await fetchAllClubs();

  if (!response.error) {
    respond.success(res, 200, 'Clubs fetched successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error fetching clubs', response.result);
  }
});

/**
 * Create a new club bross
 */
router.post('/new', async (req, res) => {
  const response = await createNewClub(req.body);

  if (!response.error) {
    respond.success(res, 200, 'Club created successfully', response.result);
  } else {
    respond.fail(res, 500, 'Error creating club', response.result);
  }
});

/**
 * fetchSingleClubById
 *
 * fetch a single club by it's id brozay
 */
router.get('/get/:id', async (req, res) => {
  const response = await fetchSingleClubById(req.params.id);

  if (!response.error) {
    respond.success(res, 200, 'Club fetched successfully', response);
  } else {
    respond.fail(res, 400, 'Error fetching club', response!.result);
  }
});

/**
 * add Player to club
 */

router.put(
  '/:id/sign-player',
  updatePlayerSigning,
  addPlayerToClubMiddleware,
  calculateClubRating
);

export default router;
