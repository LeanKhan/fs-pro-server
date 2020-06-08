import DB from '../../db';
import { incrementCounter } from '../../utils/counter';

/**
 * fetchAll
 */
export function fetchAll(
  query: {} = {},
  populate: Boolean | String = false,
  select: Boolean | String = false
) {
  if (populate && select) {
    return DB.Models.Season.find(query)
      .populate(populate)
      .select(select)
      .lean()
      .exec();
  }

  if (populate) {
    return DB.Models.Season.find(query).populate(populate).lean().exec();
  }

  return DB.Models.Season.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific season by its id
 * @param id
 */
export function fetchOneById(id: string) {
  return DB.Models.Season.findById(id).populate('Fixtures').lean().exec();
}

export function findByIdAndUpdate(id: string, update: any) {
  return DB.Models.Season.findByIdAndUpdate(id, update, { new: true })
    .lean()
    .exec();
}
/**
 * create new season
 */

export function createNew(data: any) {
  const SEASON = new DB.Models.Season(data);

  return SEASON.save()
    .then((season) => {
      incrementCounter('season_counter');
      return { error: false, result: season };
    })
    .catch((error) => ({ error: true, result: error }));
}

export async function deleteById(id: string) {
  return DB.Models.Season.findByIdAndDelete(id).lean().exec();
}
