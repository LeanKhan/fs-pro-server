// Exposes functions that are used to interact with the DB directly
import DB from '../../db';
import { Types } from 'mongoose';
import { Club, ClubInterface } from './club.model';
import log from '../../helpers/logger';
import { IClub } from '../../interfaces/Club';

/**
 * fetchAllClubs mate
 *
 * Returns all the clubs in the game
 * @returns - {error: boolean, result: any | IClubModel}
 */
export function fetchAllClubs() {
  return DB.Models.Club.find({}).populate('Players Manager').lean().exec();
}

/**
 * fetchClubs
 */
export function fetchClubs(
  condition: any,
  select?: string | boolean
): Promise<IClub[]> {
  // TODO: check if you can send all these options as an object....
  if (select) {
    return DB.Models.Club.find(condition).select(select).lean().exec();
  }
  return DB.Models.Club.find(condition).populate('Players').lean().exec();
}

export function deleteById(id: string) {
  return DB.Models.Club.findByIdAndDelete(id).lean().exec();
}
/**
 * Delete Club by Id using 'remove' method
 *
 * @param id Club Id
 * @returns
 */
export async function deleteByRemove(id: string) {

  const doc = await DB.Models.Club.findById(id);

   if(!doc) {
     throw new Error(`Club [${id}] does not exist`);
   }

   return doc.remove();
  }

/**
 * fecthSingleClubById
 *
 * get a single club by its id brooooo
 *
 * @param id Club id
 */
export function fetchSingleClubById(
  id: any,
  populate: string | boolean
): Promise<ClubInterface> {

  if (populate) {
    let po = '';

    try {
      po = JSON.parse(populate as string);
      // this could be an array!
    } catch (err) {
      console.error(`Error parsing populate field => ${err}`);
      throw new Error(`Cannot parse populate query => ${err}`);
    }
    // Accpet object to populate fields
    return DB.Models.Club.findById(id).populate(po).lean().exec();
  } else {
    return DB.Models.Club.findById(id).lean().exec();
  }
}

/**
 * Fetch League Clubs doe...
 * @param clubId
 * @param playerId
 */
export function fetchLeagueClubs(_clubs: string[]) {
  return DB.Models.Club.find({ _id: { $in: _clubs } })
    .select('ClubCode Name Address Stadium')
    .lean()
    .exec();
}
/**
 * Add player to club
 * @param clubId
 * @param playerId
 */
export function addPlayerToClub(clubId: string, playerId: string) {
  return DB.Models.Club.findByIdAndUpdate(clubId, {
    $push: { Players: playerId },
  })
    .lean()
    .exec();
}

/**
 * Calculate the clubs Average Rating...
 *
 * @param clubId
 */
export function calculateClubsTotalRatings(clubId: string) {
  // TODO: Guy! Just do the calculation yourself!
  // Do first stage grouping...
  return DB.Models.Club.aggregate(
    [
      { $match: { _id: Types.ObjectId(clubId) } },
      {
        $lookup: {
          from: 'Players',
          localField: 'Players',
          foreignField: '_id',
          as: 'players',
        },
      },
      { $unwind: '$players' },
      {
        $group: {
          _id: '$players.Position',
          avg_rating: { $avg: '$players.Rating' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          position: '$_id',
          avg_rating: 1,
          count: 1,
        },
      },
    ],
    () => {
      log('Aggregate performed!');
    }
  );
}

/**
 * createNewClub mate
 *
 * @param c Club making data
 * @returns - {error: boolean, result: any | IClubModel}
 */
export function createNewClub(_club: any) {
  const CLUB = new DB.Models.Club(_club);

  return CLUB.save()
    .then((club) => ({ error: false, result: club }))
    .catch((error) => ({ error: true, result: error }));
}

// Clubs _must_ always be in a league
// they may not necessarily be in a cup or tournament...

/**
 * Add LeagueCode to Club
 * @param playerId
 * @param value
 */
export function updateClubLeague(
  clubId: string,
  leagueCode: string,
  leagueId: string
) {
  return DB.Models.Club.findByIdAndUpdate(clubId, {
    $set: { LeagueCode: leagueCode, League: leagueId },
  })
    .lean()
    .exec();
}

/**
 * update club
 */

export function updateClub(
  clubId: string,
  data: any = {}
): Promise<ClubInterface> {
  return DB.Models.Club.findByIdAndUpdate(clubId, data, { new: true })
    .lean()
    .exec();
}

export function updateClubsById(clubIds: string[], data: any = {}) {
  return DB.Models.Club.updateMany({ _id: { $in: clubIds } }, data, {
    new: true,
  })
    .lean()
    .exec();
}

/**
 * Create Many Clubs
 */
export function createMany(clubs: any[]) {
  return DB.Models.Club.insertMany(clubs, { ordered: true });
}

interface IClubsResponse {
  error: boolean;
  message?: string;
  result: Club[];
}

// interface ServiceResponse {
//   error: boolean;
//   message?
// }
