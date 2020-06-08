import DB from '../../db';

/**
 * fetchAll
 */
export function fetchAll(query: {} = {}) {
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

export function createCalendars(Calendars: any[]) {
  return DB.Models.Calendar.insertMany(Calendars, { ordered: true });
}

/**
 * create new Calendar year...
 */

export function createNew(data: any) {
  const Calendar = new DB.Models.Calendar(data);

  return Calendar.save()
    .then((c) => {
      return { error: false, result: c.toObject() };
    })
    .catch((error) => ({ error: true, result: error }));
}

export async function deleteById(id: string) {
  return DB.Models.Calendar.findByIdAndDelete(id).lean().exec();
}
