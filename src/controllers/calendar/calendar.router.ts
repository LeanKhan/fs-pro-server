import { Router, Request, Response } from 'express';
import respond from '../../helpers/responseHandler';
import { fetchOneById, fetchAll, deleteById } from './calendar.service';
import {
  getSeasons,
  generateCalendar,
  saveCalendar,
  getCurrentCalendar,
  startYear,
} from './calendar.controller';
import { fetchMany } from '../days/day.service';

const router = Router();

/** Get Calendar by id */
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
    .then((calendars) => {
      respond.success(
        res,
        200,
        'All Calendars fetched successfully',
        calendars
      );
    })
    .catch((err) => {
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
    .then((days) => {
      return respond.success(
        res,
        200,
        'Days of Calendar Year fetched successfully!',
        days
      );
    })
    .catch((err) => {
      return respond.fail(res, 400, 'Error fetching days in calendar', err);
    });
});

/** Get current Calendar */
router.get('/current', getCurrentCalendar);

/** Create new Calendar year */
router.post('/new', getSeasons, generateCalendar, saveCalendar);

/** Start Calendar Year... */
router.post('/:year/start', startYear);

export default router;
