import log from '../../helpers/logger';
import DB from '../../db';
import { IPlayer } from '../../interfaces/Player';
import { calculatePlayerValue } from '../../utils/players';
import { PlayerMatchDetailsInterface } from '../player-match/player-match.model';

/**
 * fetchAllPlayers
 *
 * fetch multiple Players based on query
 * default behaviour is to send all players in the db
 */
export function fetchAll(query: Record<string, unknown> = {}) {
  return DB.Models.Player.find(query).lean().exec();
}

/**
 * FetchOneById
 *
 * Fetch a specific Player by id
 * @param id
 */
export function fetchOneById(id: string) {
  return DB.Models.Player.findById(id).lean().exec();
}

export function updateById(id: string, update: any): Promise<IPlayer> {
  return DB.Models.Player.findByIdAndUpdate(id, update, { new: true })
    .lean()
    .exec();
}
/**
 * delete Player by id
 * @param id
 */
export function deletePlayer(id: string) {
  return DB.Models.Player.findByIdAndDelete(id).lean().exec();
}

/**
 * Create new player broooooo
 *
 * @param p Player making data
 * @returns - {error: boolean, result: any}
 */
export const createNewPlayer = async (_player: IPlayer) => {
  _player.Value = calculatePlayerValue(
    _player.Position,
    _player.Rating,
    _player.Age
  );

  const PLAYER = new DB.Models.Player(_player);

  return PLAYER.save()
    .then((player) => ({ error: false, result: player }))
    .catch((error) => ({ error: true, result: error }));
};

/**
 * Toggle Signed
 * @param playerId
 * @param value
 */
export function toggleSigned(
  playerId: string,
  value: boolean,
  clubCode: string | null
) {
  return DB.Models.Player.findByIdAndUpdate(playerId, {
    $set: { isSigned: !value, ClubCode: clubCode },
  })
    .lean()
    .exec();
}

export function updatePlayers(query: any, update: any) {
  return DB.Models.Player.updateMany(query, update);
}

export function getPlayerStats(year: string) {
  return DB.Models.PlayerMatch.aggregate(
    [
      {
        $lookup: {
          from: 'Fixtures',
          localField: 'Fixture',
          foreignField: '_id',
          as: 'fixture',
        },
      },
      { $unwind: '$fixture' },
      {
        $lookup: {
          from: 'Seasons',
          localField: 'fixture.Season',
          foreignField: '_id',
          as: 'season',
        },
      },
      { $unwind: '$season' },
      { $match: { 'season.Year': year } }, // Filter by the Year
      {
        $group: {
          _id: '$Player',
          goals: { $sum: '$Goals' },
          saves: { $sum: '$Saves' },
          passes: { $sum: '$Passes' },
          tackles: { $sum: '$Tackles' },
          assists: { $sum: '$Assists' },
          clean_sheets: { $sum: '$CleanSheets' },
          dribbles: { $sum: '$Dribbles' },
          points: { $avg: '$Points' },
          form: { $avg: '$Form' },
        },
      },
      {
        $lookup: {
          from: 'Players',
          localField: '_id',
          foreignField: '_id',
          as: 'player',
        },
      }, // Get the Player's details
      { $unwind: '$player' },
      { $sort: { points: -1 } },
    ],
    () => {
      log('Player Match Details Aggregate performed!');
    }
  );
}

export function getSpecificPlayerStats(matcher: any, sorter: any) {
  return DB.Models.PlayerMatch.aggregate(
    [
      {
        $lookup: {
          from: 'Fixtures',
          localField: 'Fixture',
          foreignField: '_id',
          as: 'fixture',
        },
      },
      { $unwind: '$fixture' },
      {
        $lookup: {
          from: 'Seasons',
          localField: 'fixture.Season',
          foreignField: '_id',
          as: 'season',
        },
      },
      { $unwind: '$season' },
      { $match: matcher }, // Filter by the Year
      {
        $group: {
          _id: '$Player',
          goals: { $sum: '$Goals' },
          saves: { $sum: '$Saves' },
          passes: { $sum: '$Passes' },
          tackles: { $sum: '$Tackles' },
          assists: { $sum: '$Assists' },
          clean_sheets: { $sum: '$CleanSheets' },
          dribbles: { $sum: '$Dribbles' },
          points: { $avg: '$Points' },
          form: { $avg: '$Form' },
        },
      },
      {
        $lookup: {
          from: 'Players',
          localField: '_id',
          foreignField: '_id',
          as: 'player',
        },
      }, // Get the Player's details
      { $unwind: '$player' },
      { $sort: sorter },
    ],
    () => {
      log('Player Match Details Aggregate performed!');
    }
  );
}

export function allPlayerStats(
  season: string
): Promise<PlayerMatchDetailsInterface[]> {
  return DB.Models.PlayerMatch.aggregate(
    [
      {
        $lookup: {
          from: 'Fixtures',
          localField: 'Fixture',
          foreignField: '_id',
          as: 'fixture',
        },
      },
      { $unwind: '$fixture' },
      { $match: { 'fixture.Season': season } },
    ],
    () => {
      log('Player Match Stats for entire Season gotten!');
    }
  );
}
