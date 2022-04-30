import DB from '../../db';
import { incrementCounter } from '../../utils/counter';
import { Fixture } from './fixture.model';

/**
 * fetchAll
 */
export function fetchAll(query: Record<string, unknown> = {}, select = '') {
  const h = { path: 'HomeSideDetails', populate: { path: 'PlayerStats' } };
  const a = { path: 'AwaySideDetails', populate: { path: 'PlayerStats' } };
  return DB.Models.Fixture.find(query)
    .populate(h)
    .select(select)
    .populate(a)
    .lean()
    .exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific fixture by its id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate: string | Record<string, unknown> | boolean = {
    path: 'ClubMatchDetails',
  }
) {
  const h = { path: 'HomeSideDetails', populate: { path: 'PlayerStats' } };
  const a = { path: 'AwaySideDetails', populate: { path: 'PlayerStats' } };

  console.log(populate);

  if (populate) {
    return DB.Models.Fixture.findById(id)
      .populate(populate)
      .populate(h)
      .populate(a)
      .lean()
      .exec();
  }

  return DB.Models.Fixture.findById(id).populate(h).populate(a).lean().exec();
}

export function createFixtures(fixtures: any[]) {
  return DB.Models.Fixture.insertMany(fixtures, { ordered: true });
}

/**
 * create new fixture
 */

export function createNew(data: any) {
  const FIXTURE = new DB.Models.Fixture(data);

  return FIXTURE.save()
    .then((fixture) => {
      void incrementCounter('fixture_counter');
      return { error: false, result: fixture };
    })
    .catch((error) => ({ error: true, result: error }));
}

export function deleteById(id: string) {
  return DB.Models.Fixture.findByIdAndDelete(id).lean().exec();
}

export async function deleteByRemove(id: string) {
  /**
  * Delete the Fixture
  */

  const doc = await DB.Models.Fixture.findById(id);

  if(!doc) {
    throw new Error(`Fixture ${id} does not exist`);
  }

  return doc.remove();
}

/**
 *
 * @param data Find one and update
 */
export function findOneAndUpdate(
  query: Record<string, unknown>,
  update: any
): Promise<Fixture> {
  return DB.Models.Fixture.findOneAndUpdate(query, update, { new: true })
    .lean()
    .exec();
}

export function deleteAll(query: Record<string, unknown>) {
  return DB.Models.Fixture.deleteMany(query);
}
