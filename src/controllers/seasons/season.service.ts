import DB from '../../db';
import { incrementCounter } from '../../utils/counter';

/**
 * fetchAll
 */
export async function fetchAll(query: {} = {}) {
  try {
    const seasons = await DB.Models.Season.find(query);
    return { error: false, result: seasons };
  } catch (error) {
  	console.log('Error!', error)
    return { error: true, result: error };
  }
}

/**
 * FetchOneById 
 *
 * Fetch a specific season by its id
 * @param id
 */
export async function fetchOneById(id: string) {
  try {
    const season = await DB.Models.Season.findById(id);
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
    .then(season => { incrementCounter('season_counter'); return {error: false, result: season} })
    .catch(error => ({ error: true, result: error }));
}

export async function deleteById(id: string) {
  try {
  await DB.Models.Season.findByIdAndDelete(id)
    return { error: false };
  } catch (error) {
    return { error: true, result: error };
  }
}