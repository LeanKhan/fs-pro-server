import express from 'express';
import respond from '../helpers/responseHandler';
import {
  fetchAllClubs,
  createNewClub,
  fetchSingleClubById,
} from '../services/club.service';

const router = express.Router();

// Get all clubs bro
router.get('/all', async (req, res) => {
  const response = await fetchAllClubs();

  if (!response.error) {
    // Use the response handler to send a success message
    respond.success(res, 200, 'Clubs retrieved successfully', response.result);
  } else {
    // Use the response handler to send a fail message
    respond.fail(res, 400, 'Error fetching clubs', response.result);
  }
});

/**
 * Create a new club bross
 */
router.post('/new', async (req, res) => {
  const response = await createNewClub(req.body);

  if (!response.error) {
    respond.success(res, 200, `${response.result.Name}`);
  } else {
    respond.fail(res, 500, 'Error creting new club', response.result);
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
    respond.success(res, 200, 'Club fetched successfully', response.result);
  } else {
    respond.fail(res, 404, 'Club not found', response.result);
  }
});

export default router;
