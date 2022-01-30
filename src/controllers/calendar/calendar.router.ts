import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById, fetchAll, deleteById } from './calendar.service';
import {
  getCurrentCalendar,
  startYear,
  createCalendarYear,
  setupDaysInYear,
  createSeasonsInTheYear,
  endYear,
} from './calendar.controller';
import { fetchMany } from '../days/day.service';
import { updatePlayersDetails } from '../players/player.controller';
import { updateAllClubsRating } from '../../middleware/club';
import { setupRoutes } from '../../helpers/queries';

const router = Router();

// TODO: change route scheme for Calendars to

// /calendars/<action>
// /calendars/<entity>/<action>
// instead of /calendar/calendars/<entity>

/** Get Calendar by id */
router.get('/calendars/:id', (req, res) => {
  const response = fetchOneById(req.params.id);

  response
    .then((fixture: any) => {
      respond.success(res, 200, 'Fixtured fetched successfully', fixture);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching Fixture', err);
    });
});

/** Delete Calendar by id */
router.delete('/calendars/:id', (req, res) => {
  deleteById(req.params.id)
    .then((calendar: any) => {
      respond.success(res, 200, 'Calendar deleted successfully :)', calendar);
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error deleting Calendar', err);
    });
});

/** Get all Calendars */
router.get('/calendars', (req, res) => {
  const response = fetchAll();

  response
    .then((calendars: any) => {
      respond.success(
        res,
        200,
        'All Calendars fetched successfully',
        calendars
      );
    })
    .catch((err: any) => {
      respond.fail(res, 400, 'Error fetching all Calendars', err);
    });
});

/** Get days of a Calendar by Year */
router.get('/:year/days', (req: Request, res: Response) => {
  const { year } = req.params;
  const { paginate = false, populate = false, not_played = true , week, limit } = req.query;

  let query = { Year: year };

  if (not_played) {
    query = { ...query,  "isFree": false, "Matches.Played": false }
  }

  fetchMany(
    query,
    JSON.parse(populate),
    JSON.parse(paginate),
    week,
    limit
  )
    .then((days: any) => {
      return respond.success(
        res,
        200,
        'Days of Calendar Year fetched successfully!',
        days
      );
    })
    .catch((err: any) => {
      console.log(err);
      console.error(err);
      return respond.fail(res, 400, 'Error fetching days in calendar', err);
    });
});

/** Get current Calendar */
router.get('/current', getCurrentCalendar);

/** Create Calendar Year! */
router.post('/new', createCalendarYear);

/**
 * After a Year has been created, we must add Seasons to it and add Days to the Year
 * - Then the Calendar process is complete!
 * - A Calendar Year ends when a new one Starts
 * - Next, Start the Calendar and go and play matches! :) Thank you Jesus
 * This endpoint, setups Year and Activates it ! Thank you Jesus!
 */
router.post(
  '/:year/:id/setup-and-start',
  createSeasonsInTheYear,
  setupDaysInYear,
  startYear
);

/** Start Calendar Year... */
router.post('/:year/:id/start', startYear);

/** End Calendar Year... */
router.post('/:id/end', endYear, updatePlayersDetails, updateAllClubsRating);

router.get('/:id/update-ages', updatePlayersDetails);

setupRoutes(router, 'Calendar');

export default router;
