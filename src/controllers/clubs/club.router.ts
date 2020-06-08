import { Router } from 'express';
import respond from '../../helpers/responseHandler';
import {
  fetchAllClubs,
  createNewClub,
  fetchSingleClubById,
  fetchClubs,
  updateClub,
  deleteById,
} from './club.service';
import { updatePlayerSigning } from '../../middleware/player';
import {
  addPlayerToClubMiddleware,
  calculateClubRating,
} from '../../middleware/club';

const router = Router();

// Get all clubs bro
router.get('/all', async (req, res) => {
  const response = fetchAllClubs();

  response
    .then((clubs) => {
      respond.success(res, 200, 'Clubs fetched successfully', clubs);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Clubs', err);
    });
});

router.get('/fetch', async (req, res) => {
  // fetch clubs with query and all
  let query;
  let select;
  try {
    query = req.query.q || {};
    query = JSON.parse(req.query.q);
    select = req.query.select || {};
    select = JSON.parse(select);
  } catch (err) {
    return respond.fail(res, 400, 'Error parsing JSON for Clubs query => ', {
      error: err,
      query,
      select,
    });
  }

  const response = fetchClubs(query, select);

  response
    .then((clubs) => {
      return respond.success(res, 200, 'Clubs fetched successfully', clubs);
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Error fetching Clubs', err);
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
