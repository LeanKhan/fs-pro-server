import playerModel from './player.model';
import { IPlayer } from '../../interfaces/Player';
import { calculatePlayerValue } from '../../utils/players';

/**
 * fetchAllPlayers
 *
 * return all the players in the game
 */
export const fetchAllPlayers = async (options = {}) => {
  try {
    const players = await playerModel.find(options);
    return { error: false, result: players };
  } catch (err) {
    return { error: true, result: err };
  }
};

/**
 * Create new player broooooo
 *
 * @param p Player making data
 * @returns - {error: boolean, result: any}
 */
export const createNewPlayer = async (p: IPlayer) => {
  p.Value = calculatePlayerValue(p.Rating, p.Age);

  const PLAYER = new playerModel(p);

  return PLAYER.save()
    .then(player => ({ error: false, result: player }))
    .catch(error => ({ error: true, result: error }));
};

/**
 * Toggle Signed
 * @param playerId
 * @param value
 */
export const toggleSigned = async (
  playerId: string,
  value: boolean,
  clubCode: string
) => {
  return playerModel
    .findByIdAndUpdate(playerId, {
      $set: { isSigned: value, ClubCode: clubCode },
    })
    .then(res => ({
      error: false,
      message: 'Player signed status changed successfully',
      result: null,
    }))
    .catch(err => ({ error: true, result: err }));
};
