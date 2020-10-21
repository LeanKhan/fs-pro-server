import { Router } from 'express';
import {
  fetchAll,
  fetchOneById,
  deleteById,
  create,
  updateById,
} from './manager.service';
import respond from '../../helpers/responseHandler';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';

const router = Router();

/** FETCH ALL MANAGERS */
router.get('/', (req, res) => {
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

  fetchAll(options)
    .then((managers) => {
      respond.success(res, 200, 'Managers fetched successfully', managers);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching players', err);
    });
});

/** GET MANAGER BY ID */
router.get('/:id', (req, res) => {
  // Get Manager by name slug
  const { id } = req.params;

  fetchOneById(id)
    .then((player) => {
      respond.success(res, 200, 'Manager fetched successfully', player);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Manager', err);
    });
});

/** DELETE MANAGER BY ID */
router.delete('/:id', (req, res) => {
  // Delete Manager by name
  const { id } = req.params;

  deleteById(id)
    .then((player) => {
      respond.success(res, 200, 'Manager deleted successfully', player);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error deleting Manager', err);
    });
});

/** UPDATE MANAGER BY id */
router.put('/:id', (req, res) => {
  // Update manager by id

  const { id } = req.params;
  const { data } = req.body;

  updateById(id, data)
    .then((manager) => {
      respond.success(res, 200, 'Manager updated successfully', manager);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error updating Manager', err);
    });
});

/** CREATE NEW MANAGER */
router.post('/', getCurrentCounter, async (req, res) => {
  // Create a new Manager
  const response = await create(req.body.data);

  if (!response.error) {
    respond.success(res, 200, 'Manger created successfully', response.result);
    incrementCounter('manager_counter');
  } else {
    respond.fail(res, 400, 'Error creating Manager', response.result);
  }
});

// Maybe lookup Managers by their id instead...
export default router;
