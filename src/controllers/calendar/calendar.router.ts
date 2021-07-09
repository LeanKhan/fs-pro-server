import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById, fetchAll, deleteById } from './calendar.service';
import {
  getSeasons,
  generateCalendar,
  saveCalendar,
  getCurrentCalendar,
  startYear,
  createCalendarYear,
  startYear2,
  doAll,
} from './calendar.controller';
import { fetchMany } from '../days/day.service';
import { incrementCounter } from '../../utils/counter';

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
  const response = deleteById(req.params.id);

  response
    .then((calendar) => {
      respond.success(res, 200, 'Calendar deleted successfully :)', calendar);
    })
    .catch((err) => {
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
  const { paginate = false, populate = false, week, limit } = req.query;

  fetchMany(
    { Year: year },
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
      return respond.fail(res, 400, 'Error fetching days in calendar', err);
    });
});

/** Get current Calendar */
router.get('/current', getCurrentCalendar);

/** Create new Calendar year */
router.post('/new', getSeasons, generateCalendar, saveCalendar);

router.post('/new-2', createCalendarYear);
router.post('/:year/:id/start-2', startYear2);
// router.post('/:year/:id/start-2', doAll, startYear2);

router.get('/test', async (req, res) => {
  const p = await incrementCounter('season_counter');

  return respond.success(res, 200, 'test carried out successfully', p);
});

/** Start Calendar Year... */
router.post('/:year/start', startYear);

export default router;
