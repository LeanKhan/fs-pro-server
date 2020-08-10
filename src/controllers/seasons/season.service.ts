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
 *
 * @param data Find one and update
 */
export function findOneAndUpdate(query: {}, update: any, options: any) {
  return DB.Models.Season.findOneAndUpdate(query, update, {
    new: true,
    ...options,
  })
    .lean()
    .exec();
}

/**
 * Update many seasons that match a particular query
 * @param query
 * @param update
 * @param options
 */
export function findAndUpdate(query: {}, update: any) {
  return DB.Models.Season.updateMany(query, update).lean().exec();
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
