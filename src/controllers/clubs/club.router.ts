import express from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAllClubs,
  createNewClub,
  fetchSingleClubById,
  updateClub,
  deleteById,
} from './club.service';
import { updatePlayerSigning } from '../../middleware/player';
import {
  addPlayerToClubMiddleware,
  calculateClubRating,
} from '../../middleware/club';

const router = express.Router();

// Get all clubs bro
router.get('/all', async (req, res) => {
  const response = fetchAllClubs();

  response
    .then((clubs) => {
      respond.success(res, 200, 'Competition deleted successfully', clubs);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Competition', err);
    });
});

/**
 * Create a new club bross
 */
router.post('/new', async (req, res) => {
  const response = await createNewClub(req.body.data);

  if (!response.error) {
    respond.success(res, 200, 'Club created successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error creating club', response.result);
  }
});

router.post('/:id/update', (req, res) => {
  const data = req.body.data;

  const response = updateClub(req.params.id, data);

  response
    .then((club) => {
      respond.success(res, 200, 'Club updated successfully', club);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error updating Club', err);
    });
});

router.delete('/:id', (req, res) => {
  const response = deleteById(req.params.id);

  response
    .then((data) => {
      respond.success(res, 200, 'Club deleted successfully', data);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Club', err);
    });
});

/**
 * fetchSingleClubById
 *
 * fetch a single club by it's id brozay
 */
router.get('/:id', async (req, res) => {
  const response = fetchSingleClubById(req.params.id, req.query.populate);

  response
    .then((club) => {
      respond.success(res, 200, 'Club fetched successfully', club);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Club', err);
    });
});

/**
 * add Player to club
 */

router.put(
  '/:id/add-player',
  updatePlayerSigning,
  addPlayerToClubMiddleware,
  calculateClubRating
);

router.put(
  '/:id/remove-player',
  updatePlayerSigning,
  addPlayerToClubMiddleware,
  calculateClubRating
);

export default router;
