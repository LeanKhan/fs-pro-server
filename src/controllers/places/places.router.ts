import { Router } from 'express';
import {
  fetchMany,
  fetchOneById,
  deleteById,
  fetchOne,
  findOneAndUpdate,
} from './places.service';
import respond from '../../helpers/responseHandler';
import { PlaceInterface } from './places.model';
import log from '../../helpers/logger';
import {baseQuery, setupRoutes} from '../../helpers/queries';

const router = Router();

/** FETCH ALL PLACES */
router.get('/', (req, res) => {
  let options = req.query.options || {};
  // This prevents the app from crashing if there's
  // an error parsing object :)
  try {
    if (req.query.options) {
      options = JSON.parse(req.query.options);
    }
  } catch (err) {
    log(`Error parsing JSON => ${err}`);
  }

/** e.g to fetch all countries: options => {Type: 'country'} */
  fetchMany(options)
    .then((places: any[]) => {
      respond.success(res, 200, 'Places fetched successfully', places);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching players', err);
    });
});


/** Get Place by name or code */
router.get('/country', (req, res) => {
  // Get Place by name slug
  fetchMany({Type: 'country'})
    .then((p) => {
      respond.success(res, 200, 'Countries fetched successfully', p);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Countries', err);
    });
});


/** GET PLACE BY ID */
router.get('/:id', (req, res) => {
  // Get Place by name slug
  const { id } = req.params;
  let po = false;
  try {
    po = req.query.populate && JSON.parse(req.query.populate);
  } catch (err) {
    console.error('Error fetching place, ', +err);
    return respond.fail(
      res,
      400,
      'Error fetching Place: Error populating field(s)',
      err
    );
  }

  fetchOneById(id, po)
    .then((p) => {
      respond.success(res, 200, 'Place fetched successfully', p);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Place', err);
    });
});

/** Get Place by name or code */
router.get('/name/:name', (req, res) => {
  // Get Place by name slug
  const { name, code } = req.params;

  fetchOne({Name: name, Code: code})
    .then((p) => {
      respond.success(res, 200, 'Place fetched successfully', p);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Place', err);
    });
});

/** DELETE PLACE BY ID */
// router.delete('/:id', (req, res) => {
  // TODO: COMPLETE!
// });

/** UPDATE PLACE BY id */
router.put('/:id', (req, res) => {
  // Update place by id

  const { id } = req.params;
  const { data } = req.body;

  findOneAndUpdate({_id: id}, data)
    .then((place) => {
      respond.success(res, 200, 'Place updated successfully', place);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error updating Place', err);
    });
});

setupRoutes(router, 'Place');

/** Update all Models NOT NEEDED FOR NOW! */
// router.put('/work/update-all-models', updateAllModels);

export default router;
