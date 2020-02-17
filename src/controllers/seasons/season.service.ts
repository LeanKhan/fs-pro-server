import SeasonModel from './season.model';

/**
 * fetchAll
 */
export function fetchAll() {
  try {
    const seasons = SeasonModel.find({});
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
    const season = SeasonModel.findById(id);
    return { error: false, result: season };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * create new season
 */

export function createNew(data: any) {
  const SEASON = new SeasonModel(data);

  return SEASON.save()
    .then(season => ({ error: false, result: season }))
    .catch(error => ({ error: true, result: error }));
}
