// Exposes functions that are used to interact with the DB directly
import DB from '../../db';
import { IClub } from '../../interfaces/Club';

/**
 * fetchAllClubs mate
 *
 * Returns all the clubs in the game
 * @returns - {error: boolean, result: any | IClubModel}
 */
export async function fetchAllClubs() {
  try {
    const clubs = await DB.Models.Club.find({}).populate('Players');
    return { error: false, result: clubs };
  } catch (err) {
    return { error: true, result: err };
  }
}

/**
 * fetchClubs
 */
export async function fetchClubs(condition: any) {
  try {
    const clubs = await DB.Models.Club.find(condition).populate('Players');
    return { error: false, result: clubs } as IClubsResponse;
  } catch (error) {
    return { error: true, result: error } as IClubsResponse;
  }
}

/**
 * fecthSingleClubById
 *
 * get a single club by its id brooooo
 *
 * @param id Club id
 */
export async function fetchSingleClubById(id: any) {
  try {
    const club = await DB.Models.Club.findById(id);
    return { error: false, result: club };
  } catch (err) {
    return { error: true, result: err };
  }
}

/**
 * Add player to club
 * @param clubId
 * @param playerId
 */
export async function addPlayerToClub(clubId: string, playerId: string) {
  return DB.Models.Club.findByIdAndUpdate(clubId, {
    $push: { Players: playerId },
  })
    .then(res => ({ error: false, result: '' }))
    .catch(err => ({ error: true, result: err }));
}

/**
 *
 * @param clubId
 */
export async function calculateClubsTotalRatings(clubId: string) {
  return DB.Models.Club.aggregate([
    { $match: { _id: clubId } },
    { $addFields: { Rating: { $avg: '$Players.Rating' } } },
  ])
    .then(res => ({ error: false, result: '' }))
    .catch(err => ({ error: true, result: err }));
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
    .then(club => ({ error: false, result: club }))
    .catch(error => ({ error: true, result: error }));
}

// Clubs _must_ always be in a league
// they may not necessarily be in a cup or tournament...

/**
 * Add LeagueCode to Club
 * @param playerId
 * @param value
 */
export const updateClubLeague = async (
  clubId: string,
  leagueCode: string,
  leagueId: string
) => {
  return DB.Models.Club.findByIdAndUpdate(clubId, {
    $set: { LeagueCode: leagueCode, League: leagueId },
  })
    .then(res => ({
      error: false,
      message: 'Club league updated successfully!',
      result: null,
    }))
    .catch(err => ({ error: true, result: err }));
};

interface IClubsResponse {
  error: boolean;
  message?: string;
  result: IClub[];
}

// interface ServiceResponse {
//   error: boolean;
//   message?
// }
