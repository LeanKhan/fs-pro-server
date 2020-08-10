import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById } from './calendar.service';
import {
  getSeasons,
  generateCalendar,
  saveCalendar,
  getCurrentCalendar,
  startYear,
} from './calendar.controller';

const router = Router();

router.get('/calendars/:id', (req, res) => {
  const response = fetchOneById(req.params.id);

  response
    .then((fixture) => {
      respond.success(res, 200, 'Fixtured fetched successfully', fixture);
    })
    .catch((err) => {
      respond.fail(res, 400, 'Error fetching Fixture', err);
    });
});

router.get('/current', getCurrentCalendar);

// interface NewCalendarYearBody {
//     competitions:
// }

// Create new calendar year...
router.post('/new', getSeasons, generateCalendar, saveCalendar);

// start year...
// This well set all the seasons to started and change the CurrentDay to 1.
router.post('/start', startYear);

export default router;
