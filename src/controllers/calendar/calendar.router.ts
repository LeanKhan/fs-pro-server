import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById } from './calendar.service';
import {
  getSeasons,
  generateCalendar,
  saveCalendar,
} from './calendar.controller';

const router = Router();

router.get('/:id', (req, res) => {
  const response = fetchOneById(req.params.id);

  response
    .then((fixture) => {
      respond.success(res, 200, 'Fixtured fetched successfully', fixture);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Fixture', err);
    });
});

// interface NewCalendarYearBody {
//     competitions:
// }

// Create new calendar year...
router.post('/new', getSeasons, generateCalendar, saveCalendar);

export default router;
