/* eslint-disable @typescript-eslint/no-unsafe-return */
import log from '../../helpers/logger';
import DB from '../../db';
import { PlayerInterface } from '../../interfaces/Player';
import { calculatePlayerValue } from '../../utils/players';
import { PlayerMatchDetailsInterface } from '../player-match/player-match.model';
import { Types } from 'mongoose';

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
 * fetchAllPlayers
 *
 * fetch multiple Players based on query
 * default behaviour is to send all players in the db
 */
export function findOnePlayer(query: Record<string, unknown> = {}, select: string | boolean) {
  return DB.Models.Player.findOne(query).select(select).lean().exec();
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

export function updateById(id: string, update: any): Promise<PlayerInterface> {
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

export async function deleteByRemove(id: string) {
  /**
  * Delete the Player
  */

  const doc = await DB.Models.Player.findById(id);

  if(!doc) {
    throw new Error(`Player ${id} does not exist`);
  }

  return doc.remove();
}

/**
 * Create new player broooooo
 *
 * @param p Player making data
 * @returns - {error: boolean, result: any}
 */
export const createNewPlayer = async (_player: PlayerInterface) => {
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
  clubCode: string | null,
  clubId: string | null
) {
  return DB.Models.Player.findByIdAndUpdate(playerId, {
    $set: { isSigned: !value, ClubCode: clubCode, Club: clubId },
  })
    .lean()
    .exec();
}

export function updatePlayers(query: any, update: any) {
  return DB.Models.Player.updateMany(query, update, { multi: true });
}

export function getPlayerStats(calendar_id: string) {
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
      { $match: { 'season.Calendar': Types.ObjectId(calendar_id) } }, // Filter by the Year
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
      { $match: { 'fixture.Season': Types.ObjectId(season) } },
       {
        $lookup: {
          from: 'Players',
          localField: 'Player',
          foreignField: '_id',
          as: 'player',
        },
      },
      { $unwind: '$player' },
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
          player: { "$first": "$player" },
          fixture: { "$first": "$fixture" },
         count: { $sum: 1 }
        }
      },
    ],
    () => {
      log('Player Match Stats for entire Season gotten!');
    }
  );
}

/**
 *
 * [
      {
        $lookup: {
          from: 'Fixtures',
          localField: 'Fixture',
          foreignField: '_id',
          as: 'fixture',
        },
      },
      { $unwind: '$fixture' },
      { $match: { 'fixture.Season': ObjectId("60f23609a730eb4838371762") } },
       {
        $lookup: {
          from: 'Players',
          localField: 'Player',
          foreignField: '_id',
          as: 'player',
        },
      },
      { $unwind: '$player' },
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
          player: { "$first": "$player" },
          fixture: { "$first": "$fixture" },
         count: { $sum: 1 }
        }
      },

      { $sort: {'points': -1} }
    ]
 * */


/**
 * Create Many Players
 */
export function createMany(players: any[]) {
  return DB.Models.Player.insertMany(players, { ordered: true });
}