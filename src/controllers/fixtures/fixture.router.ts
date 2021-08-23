import { Router } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById } from './fixture.service';
import { setupRoutes } from '../../helpers/queries';

const router = Router();

/** Get Fixture by id */
router.get('/:id', (req, res) => {

	let p = false;

	try {
		p = JSON.parse(req.query.populate);
	} catch (err) {
		console.log('Error parsing populate string, Fixture', err)
	}

  fetchOneById(req.params.id, p)
    .then((fixture) => {
      respond.success(res, 200, 'Fixture fetched successfully', fixture);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Fixture', err);
    });
});

setupRoutes(router, 'Fixture');

export default router;