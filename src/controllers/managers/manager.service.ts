import DB from '../../db';
import { ManagerInterface } from './manager.model';

/**
 * fetchAllPlayers
 *
 * fetch multiple Players based on query
 * default behaviour is to send all players in the db
 */
export function fetchAll(
  query: Record<string, unknown> = {}
): Promise<ManagerInterface[]> {
  return DB.Models.Manager.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific Manager by id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate = false
): Promise<ManagerInterface> {
  if (populate) {
    return DB.Models.Manager.findById(id).populate('Club').lean().exec();
  }
  return DB.Models.Manager.findById(id).lean().exec();
}

/**
 * Update a single Manager by ID
 * @param id
 * @param update
 */
export function updateById(id: string, update: any): Promise<ManagerInterface> {
  return DB.Models.Manager.findByIdAndUpdate(id, update, { new: true })
    .lean()
    .exec();
}

/**
 * Fetch one specific Manager by a query
 *
 * Fetch a specific Manager by id
 * @param query
 */
export function fetchOne(query: any): Promise<ManagerInterface> {
  return DB.Models.Manager.findOne(query).lean().exec();
}

/**
 * Update a single Manager by a query condition
 *
 * @param query
 * @param update
 */
export function update(query: any, update: any): Promise<ManagerInterface> {
  return DB.Models.Manager.findByIdAndUpdate(query, update, { new: true })
    .lean()
    .exec();
}

/**
 * delete Manager by id
 * @param id
 */
export function deleteById(id: string) {
  return DB.Models.Manager.findByIdAndDelete(id).lean().exec();
}

/** Update Many Managers */

export function updateManagers(query: any, update: any) {
  return DB.Models.Manager.updateMany(query, update);
}

/**
 * Create new Manager
 *
 * @param m Manager making data
 * @returns - {error: boolean, result: any}
 */
export async function create(m: ManagerInterface) {
  const MANAGER = new DB.Models.Manager(m);

  return MANAGER.save()
    .then((manager) => ({ error: false, result: manager }))
    .catch((error) => ({ error: true, result: error }));
}
