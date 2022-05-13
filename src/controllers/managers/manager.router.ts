import { Router } from 'express';
import {
  fetchAll,
  fetchOneById,
  deleteById,
  deleteByRemove,
  create,
  updateById,
} from './manager.service';
import respond from '../../helpers/responseHandler';
import { incrementCounter, getCurrentCounter } from '../../utils/counter';
import { updateClub } from '../clubs/club.service';
import { ManagerInterface } from './manager.model';
import log from '../../helpers/logger';
import {baseQuery, setupRoutes } from '../../helpers/queries';

const router = Router();

/** FETCH ALL MANAGERS */
router.get('/', (req, res) => {
  let options = req.query.options;
  // This prevents the app from crashing if there's
  // an error parsing object :)

  try {
    if (options) {
      options = JSON.parse(options);
    }
  } catch (err) {
  return  respond.fail(res, 400, 'Error fetching players', err.toString());
    log(`Error parsing JSON => ${err}`);
  }

  fetchAll(options, req.query.populate)
    .then((managers) => {
      respond.success(res, 200, 'Managers fetched successfully', managers);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Managers', err.toString());
    });
});

router.get('/unemployed', (req, res) => {

  fetchAll({isEmployed: false}, 'Club')
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
  let po = false;
  try {
    po = req.query.populate && JSON.parse(req.query.populate);
  } catch (err) {
    console.error('Error fetching manager, ', err.toString());
    return respond.fail(
      res,
      400,
      'Error fetching Manager: Error populating field(s)',
      err
    );
  }

  fetchOneById(id, po)
    .then((m) => {
      respond.success(res, 200, 'Manager fetched successfully', m);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Manager', err);
    });
});

/** DELETE MANAGER BY ID */
router.delete('/:id', (req, res) => {
  // Delete Manager by name
  const { id } = req.params;

  // Find the club(s) that they are employed and remove them...
  // if manager is signed to a club, remove them from that arrangement...
  const getManager = () => {
    return fetchOneById(id)
      .then((m) => {
        if (m.isEmployed && m.Club) {
          return m;
        }

        return false;
      })
      .catch((err) => {
        throw err;
      });
  };

  const _updateClub = (manager: ManagerInterface | false) => {
    const { Club, FirstName, LastName } = manager as ManagerInterface;
    if (Club) {
      // TODO: finish this, refer to manager when adding record
      updateClub(Club, {
        $unset: { Manager: 1 },
        $push: {
          Records: {
            type: 'hired',
            title: `${FirstName} ${LastName} just left the club and the system :/`,
            date: new Date(),
            details: 'Manager is no longer in the system',
          },
        },
      }).catch((err) => {
        throw err;
      });
    }
  };

  const deleteManager = () => {
    return deleteByRemove(id);
  };

  // hey, link up!
  getManager()
    .then(_updateClub)
    .then(deleteManager)
    .then((m) => {
      respond.success(res, 200, 'Manager deleted successfully', m);
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
    void incrementCounter('manager_counter');
    respond.success(res, 200, 'Manger created successfully', response.result);
  } else {
    respond.fail(res, 400, 'Error creating Manager', response.result);
  }
});

setupRoutes(router, 'Manager');

export default router;