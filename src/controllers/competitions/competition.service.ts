import DB from '../../db';
import { CompetitionInterface, CompetitionModel } from './competition.model';
/**
 * fetchAll Competitions
 */
export function fetchAll(query = {}, select = '') {
  if(select){
  return DB.Models.Competition.find(query).select(select).lean().exec();    
  }
  return DB.Models.Competition.find(query).lean().exec();
}

/**
 * Find One Competition that matches the Query
 * @param query
 * @returns
 */
export function findOne(query: Record<string, any>) {
  return DB.Models.Competition.findOne(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific competition by its id
 * @param {string} id
 */
export function fetchOneById(id: string, populate = true) {

  if(populate){
  return DB.Models.Competition.findById(id)
    .populate('Clubs')
    .populate('Seasons')
    .lean();
  }

  return DB.Models.Competition.findById(id)
    .lean();
}

export function fetchCompetition(id: string, select = '-Seasons') {
  return DB.Models.Competition.findById(id)
    .select(select)
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

export function update(id: string, data: any): Promise<CompetitionInterface> {
  return DB.Models.Competition.findByIdAndUpdate(id, data, { new: true })
    .lean()
    .exec();
}

export function deleteById(id: string) {
  return DB.Models.Competition.findByIdAndDelete(id).lean().exec();
}

/**
 * Delete by remove()
 * So that it invokes a 'remove' middleware in Mongoose
 * @param id Competition Id
 * @returns
 */
export async function deleteByRemove(id: string) {

   const doc = await DB.Models.Competition.findById(id);

   if(!doc) {
     throw new Error(`Competition [${id}] does not exist`);
   }

   return doc.remove();
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
 * Update Competition by ID
 */
export function updateCompetition(
  competitionId: string,
  update: Record<string, never>
) {
  return DB.Models.Competition.findByIdAndUpdate(competitionId, update, {
    new: true,
  })
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
