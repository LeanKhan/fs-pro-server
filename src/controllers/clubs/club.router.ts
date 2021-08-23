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
  updateAllClubsRating,
} from '../../middleware/club';
import { addManagerToClub, removeManagerFromClub } from './club.controller';
import { baseQuery, setupRoutes } from '../../helpers/queries';

const router = Router();

/** Fetch all Clubs */
router.get('/all', (req, res) => {
  const response = fetchAllClubs();

  response
    .then((clubs: any) => {
      respond.success(res, 200, 'Clubs fetched successfully', clubs);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Clubs', err);
    });
});

/** Fetch Club by query */
router.get('/fetch', (req, res) => {
  // fetch clubs with query and all
  let query;
  let select;
  try {
    query = req.query.q || {};
    query = JSON.parse(req.query.q);
    select = req.query.select || {};
    select = JSON.parse(select);
  } catch (err) {
    return respond.fail(res, 400, 'Error parsing JSON for Clubs query =>', {
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

/** Create new Club */
router.post('/new', async (req, res) => {
  const response = await createNewClub(req.body.data);

  if (!response.error) {
    respond.success(res, 200, 'Club created successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error creating club', response.result);
  }
});

/** Update Club */
router.post('/:id/update', (req, res) => {
  const data = req.body.data;

  updateClub(req.params.id, data)
    .then((club) => {
      respond.success(res, 200, 'Club updated successfully', club);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error updating Club', err);
    });
});

/** Delete Club by id */
router.delete('/:id', (req, res) => {
  const response = deleteById(req.params.id);

  response
    .then((data: any) => {
      respond.success(res, 200, 'Club deleted successfully', data);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error deleting Club', err);
    });
});

/** Fetch Club by id */
router.get('/:id', (req, res) => {
  try {
    fetchSingleClubById(req.params.id, req.query.populate)
      .then((club) => {
        respond.success(res, 200, 'Club fetched successfully', club);
      })
      .catch((err) => {
        respond.fail(res, 400, 'Error fetching Club', err);
      });
  } catch (err) {
    respond.fail(res, 400, 'Error fetching Club', err);
  }
});

/** Add Player to Club */
router.put(
  '/:id/add-player',
  updatePlayerSigning,
  addPlayerToClubMiddleware,
  calculateClubRating
);

// ! THIS WAS FOR DEVELOPMENT !
router.put('/refresh-ratings', updateAllClubsRating);

router.put('/:id/manager', addManagerToClub);

// There can only be one main manager per time so just remove
// that one...
router.delete('/:id/manager', removeManagerFromClub);

/** Remove Player from Club */
router.put(
  '/:id/remove-player',
  updatePlayerSigning,
  addPlayerToClubMiddleware,
  calculateClubRating
);

setupRoutes(router, 'Club');

export default router;

/**
 * 79.5025
 */
