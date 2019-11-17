import playerModel, { IPlayerModel } from '../models/player.model';

/**
 * fetchAllPlayers
 *
 * return all the players in the game
 */
export const fetchAllPlayers = async () => {
  try {
    const players = await playerModel.find({});
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
export const createNewPlayer = async (p: any) => {
  const PLAYER: IPlayerModel = new playerModel(p);

  return PLAYER.save()
    .then((player: IPlayerModel) => ({ error: false, result: player }))
    .catch(error => ({ error: true, result: error }));
};
