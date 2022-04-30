import DB from '../../db';
import { CalendarInterface } from './calendar.model';

/**
 * fetchAll
 */
export function fetchAll(query: unknown = {}) {
  return DB.Models.Calendar.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific season by its id
 * @param id
 */
export function fetchOneById(id: string) {
  return DB.Models.Calendar.findById(id).lean().exec();
}

/**
  fetch one calendar based on query
*/
export function fetchOne(
  query: unknown,
  populate: boolean | string = false,
  paginate: { skip: number; limit: number } = { skip: 0, limit: 14 }
): Promise<CalendarInterface> {
  if (populate && paginate) {
    // Use $slice: [skip, limit] to 'paginate' array in a way...
    return DB.Models.Calendar.findOne(query, {
      Days: { $slice: [paginate.skip, paginate.limit] },
    })
      .populate({
        path: 'Days',
        model: 'Day',
      })
      .lean()
      .exec();
  }

  return DB.Models.Calendar.findOne(query).lean().exec();
}

export function findOneAndUpdate(
  query: unknown,
  update: any
): Promise<CalendarInterface> {
  return DB.Models.Calendar.findOneAndUpdate(query, update, { new: true })
    .lean()
    .exec();
}

/** updates many.
 *
 * can use with aggregation pipeline to conditionally
 * update docs...
 */
export function findAndUpdate(query: unknown, update: any) {
  return DB.Models.Calendar.updateMany(query, update, {
    multi: true,
    new: true,
  })
    .lean()
    .exec();
}

/** update Calendar */
export function updateCalendar(id: string, update: any) {
  return DB.Models.Calendar.findByIdAndUpdate(id, update, { new: true })
    .lean()
    .exec();
}

export function createCalendars(Calendars: any[]) {
  return DB.Models.Calendar.insertMany(Calendars, { ordered: true });
}

/**
 * create new Calendar year...
 */

export function createNew(data: any) {
  const Calendar = new DB.Models.Calendar(data);

  return Calendar.save();
}

export function deleteById(id: string) {
  /**
  * Delete the Calendar, then Days, Seasons & Fixtures, then
  */

  const todelete = [ DB.Models.Calendar.findByIdAndDelete(id).lean().exec(), DB.Models.Day.deleteMany({Calendar: id}).lean().exec()];

  return Promise.all(todelete);
}

export async function deleteByRemove(id: string) {
  /**
  * Delete the Calendar, then Days, Seasons & Fixtures, then
  */

  const doc = await DB.Models.Calendar.findById(id);

  if(!doc) {
    throw new Error(`Calendar ${id} does not exist`);
  }

  return doc.remove();
};

export async function deleteDayByRemove(id: string) {
  /**
  * Delete the Calendar, then Days, Seasons & Fixtures, then
  */

  const doc = await DB.Models.Day.findById(id);

  if(!doc) {
    throw new Error(`Day ${id} does not exist on Calendar`);
  }

  return doc.remove();
}
