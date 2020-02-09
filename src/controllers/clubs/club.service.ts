// Exposes functions that are used to interact with the DB directly

import clubModel, { IClubModel } from './club.model';
import { IClub } from '../../interfaces/Club';

/**
 * fetchAllClubs mate
 *
 * Returns all the clubs in the game
 * @returns - {error: boolean, result: any | IClubModel}
 */
export const fetchAllClubs = async () => {
  try {
    const clubs = await clubModel.find({}).populate('Players');
    return { error: false, result: clubs };
  } catch (err) {
    return { error: true, result: err };
  }
};

/**
 * fetchClubs
 */
export const fetchClubs = async (condition: any) => {
  try {
    const clubs = await clubModel.find(condition).populate('Players');
    return { error: false, result: clubs } as IClubsResponse;
  } catch (error) {
    return { error: true, result: error } as IClubsResponse;
  }
};

/**
 * fecthSingleClubById
 *
 * get a single club by its id brooooo
 *
 * @param id Club id
 */
export const fetchSingleClubById = async (id: any) => {
  try {
    const club = await clubModel.findById(id);
    return { error: false, result: club };
  } catch (err) {
    return { error: true, result: err };
  }
};

/**
 * Add player to club
 * @param clubId
 * @param playerId
 */
export const addPlayerToClub = async (clubId: string, playerId: string) => {
  return clubModel
    .findByIdAndUpdate(clubId, {
      $push: { Players: playerId },
    })
    .then(res => ({ error: false, result: '' }))
    .catch(err => ({ error: true, result: err }));
};

/**
 *
 * @param clubId
 */
export const calculateClubsTotalRatings = async (clubId: string) => {
  return clubModel
    .aggregate([
      { $match: { _id: clubId } },
      { $addFields: { Rating: { $avg: '$Players.Rating' } } },
    ])
    .then(res => ({ error: false, result: '' }))
    .catch(err => ({ error: true, result: err }));
};

/**
 * createNewClub mate
 *
 * @param c Club making data
 * @returns - {error: boolean, result: any | IClubModel}
 */
export const createNewClub = (c: any) => {
  const CLUB: IClubModel = new clubModel(c);

  return CLUB.save()
    .then((club: IClubModel) => ({ error: false, result: club }))
    .catch(error => ({ error: true, result: error }));
};

interface IClubsResponse {
  error: boolean;
  message?: string;
  result: IClub[];
}