import DB from '../../db';
import { PlayerMatchDetailsInterface } from './player-match.model';
// import { PlayerMatchDetailsInterface } from './day.model';
/**
 * fetchAll PlayerMatchDetails
 */
export function fetchAll(query: Record<string, unknown> = {}) {
  return DB.Models.PlayerMatch.find(query).lean().exec();
}

/**
 * fetch many PlayerMatchDetails
 * @param query
 */
export function fetchMany(
  query: Record<string, unknown> = {},
  populate: string
) {
  if (populate)
    return DB.Models.PlayerMatch.find(query).populate(populate).lean().exec();

  return DB.Models.PlayerMatch.find(query).lean().exec();
}

/**
 * Fetch One By Id
 *
 * Fetch a specific day by its id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate: string | Record<string, unknown> | boolean = 'PlayerStats'
): Promise<PlayerMatchDetailsInterface> {
  if (populate)
    return DB.Models.PlayerMatch.findById(id).populate(populate).lean().exec();

  return DB.Models.PlayerMatch.findById(id).lean().exec();
}

/**
 * Find a One Day By any condition...
 *
 *
 * @param query the condition e.g Matche.length == 0
 */
export function findOne(
  query: any,
  populate: string | Record<string, unknown> | boolean = 'PlayerStats'
): Promise<PlayerMatchDetailsInterface> {
  if (populate)
    return DB.Models.PlayerMatch.findOne(query)
      .populate(populate)
      .lean()
      .exec();

  return DB.Models.PlayerMatch.findOne(query).lean().exec();
}

/**
 * create new day
 * @param data
 */
export function createNew(data: any) {
  const $PlayerMatchDetails = new DB.Models.PlayerMatch(data);

  return $PlayerMatchDetails
    .save()
    .then((p) => {
      return { error: false, result: p };
    })
    .catch((error) => ({ error: true, result: error }));
}

/**
 * Delete a Day by its id
 * @param id
 */
export function deleteById(id: string) {
  return DB.Models.PlayerMatch.findByIdAndDelete(id).lean().exec();
}

/**
 * Find one Day and update
 * @param {} query
 * @param update
 */
export function findOneAndUpdate(
  query: Record<string, unknown>,
  update: any
): Promise<PlayerMatchDetailsInterface> {
  return DB.Models.PlayerMatch.findOneAndUpdate(query, update, { new: true })
    .lean()
    .exec();
}

/**
 * Create many Day documents from raw PlayerMatchDetails objects
 * @param {PlayerMatchDetailsInterface} PlayerMatchDetails raw PlayerMatchDetails objects
 * @returns Array of created Document Ids :) thank you Jesus!
 */
export function createMany(PlayerMatchDetails: PlayerMatchDetailsInterface[]) {
  return DB.Models.PlayerMatch.insertMany(PlayerMatchDetails, {
    ordered: true,
  });
}
