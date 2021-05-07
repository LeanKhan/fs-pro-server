import DB from '../../db';
import { IPlayer } from '../../interfaces/Player';
import { calculatePlayerValue } from '../../utils/players';

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

export function updateById(id: string, update: any) {
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
