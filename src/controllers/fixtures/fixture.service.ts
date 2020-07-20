import DB from '../../db';
import { incrementCounter } from '../../utils/counter';
import { Fixture } from './fixture.model';
import { fixtureInterface } from '@/utils/seasons';

/**
 * fetchAll
 */
export function fetchAll(query: {} = {}) {
  return DB.Models.Fixture.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific fixture by its id
 * @param id
 */
export function fetchOneById(
  id: string,
  populate: string | object | boolean
): Promise<Fixture> {
  if (populate) {
    return DB.Models.Fixture.findById(id).populate(populate).lean().exec();
  }

  return DB.Models.Fixture.findById(id).lean().exec();
}

export function createFixtures(fixtures: any[]) {
  return DB.Models.Fixture.insertMany(fixtures, { ordered: true });
}

/**
 * create new season
 */

export function createNew(data: any) {
  const FIXTURE = new DB.Models.Fixture(data);

  return FIXTURE.save()
    .then((fixture) => {
      incrementCounter('fixture_counter');
      return { error: false, result: fixture };
    })
    .catch((error) => ({ error: true, result: error }));
}

export async function deleteById(id: string) {
  return DB.Models.Fixture.findByIdAndDelete(id).lean().exec();
}

/**
 *
 * @param data Find one and update
 */
export function findOneAndUpdate(query: {}, update: any): Promise<Fixture> {
  return DB.Models.Fixture.findOneAndUpdate(query, update, { new: true })
    .lean()
    .exec();
}
