import DB from '../../db';

/**
 * fetchAll
 */
export function fetchAll() {
  try {
    const seasons = DB.Models.Season.find({});
    return { error: false, result: seasons };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * FetchOneById
 *
 * Fetch a specific season by its id
 * @param id
 */
export function fetchOneById(id: string) {
  try {
    const season = DB.Models.Season.findById(id);
    return { error: false, result: season };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * create new season
 */

export function createNew(data: any) {
  const SEASON = new DB.Models.Season(data);

  return SEASON.save()
    .then(season => ({ error: false, result: season }))
    .catch(error => ({ error: true, result: error }));
}
