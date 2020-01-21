import CompetitionModel from './competition.model';

/**
 * fetchAll
 */
export function fetchAll() {
  try {
    const competitions = CompetitionModel.find({});
    return { error: false, result: competitions };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * FetchOneById
 *
 * Fetch a specific competition by its id
 * @param id
 */
export function fetchOneById(id: string) {
  try {
    const competition = CompetitionModel.findById(id);
    return { error: false, result: competition };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * create new competition
 */

export function createNew(data: any) {
  const COMP = new CompetitionModel(data);

  return COMP.save()
    .then(competition => ({ error: false, result: competition }))
    .catch(error => ({ error: true, result: error }));
}
