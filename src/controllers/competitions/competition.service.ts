import DB from '../../db';
/**
 * fetchAll Competitions
 */
export function fetchAll() {
  return DB.Models.Competition.find({}).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific competition by its id
 * @param {string} id
 */
export function fetchOneById(id: string) {
  return DB.Models.Competition.findById(id)
    .populate('Clubs')
    .populate('Seasons')
    .lean();
}

export function fetchCompetition(id: string) {
  return DB.Models.Competition.findById(id)
    .select('-Seasons')
    .populate('Clubs', 'ClubCode Name Address Stadium')
    .lean()
    .exec();
}

/**
 * create new competition
 */

export function createNew(data: any) {
  // tslint:disable-next-line: variable-name
  const _competition = new DB.Models.Competition(data);

  return _competition
    .save()
    .then((competition) => ({ error: false, result: competition }))
    .catch((error) => ({ error: true, result: error }));
}

export function update(id: string, data: any) {
  return DB.Models.Competition.findByIdAndUpdate(id, data, { new: true })
    .lean()
    .exec();
}

export function deleteById(id: string) {
  return DB.Models.Competition.findByIdAndDelete(id).lean().exec();
}

// TODO: Yo! Add a limit or 'size' for the max number of clubs

/**
 * Add Club to Competition
 */
export function addClub(competitionId: string, clubId: string) {
  return DB.Models.Competition.findByIdAndUpdate(
    competitionId,
    {
      $push: { Clubs: clubId },
    },
    { new: true }
  )
    .lean()
    .exec();
}

/**
 * Add Season to Competition
 * @param competitiionId
 * @param seasonId
 */
export function addSeason(competitionId: string, seasonId: string) {
  return DB.Models.Competition.findByIdAndUpdate(
    competitionId,
    {
      $push: { Seasons: seasonId },
    },
    { new: true }
  )
    .lean()
    .exec();
}
