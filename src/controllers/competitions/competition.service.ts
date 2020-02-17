import competitionModel from './competition.model';

/**
 * fetchAll
 */
export async function fetchAll() {
  try {
    const competitions = await competitionModel.find({});
    return { error: false, result: competitions };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * FetchOneById
 *
 * Fetch a specific competition by its id
 * @param {string} id
 */
export async function fetchOneById(id: string) {
  try {
    const competition = await competitionModel.findById(id);
    return { error: false, result: competition };
  } catch (error) {
    return { error: true, result: error };
  }
}

/**
 * create new competition
 */

export function createNew(data: any) {
  const COMP = new competitionModel(data);

  return COMP.save()
    .then(competition => ({ error: false, result: competition }))
    .catch(error => ({ error: true, result: error }));
}

// TODO: Yo! Add a limit or 'size' for the max number of clubs

/**
* Add Club to Competition
*/
export async function addClub (competitionId: string, clubId: string) {
  return competitionModel
    .findByIdAndUpdate(competitionId, {
      $push: { Clubs: clubId },
    })
    .then(res => ({ error: false, result: '' }))
    .catch(err => ({ error: true, result: err }));
};

