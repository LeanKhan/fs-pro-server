import { ICoordinate, IBlock } from '../classes/Ball';
import { IFieldPlayer } from '../interfaces/Player';
import { PlayingField } from '../state/ImmutableState/FieldGrid';

/**
 * Returns the tile index of the given coordinates
 *
 * @param x
 * @param y
 * @param mapWidth
 */

function XYToIndex(x: number, y: number, mapWidth: number): number {
  return y * mapWidth + x;
}

/**
 * Returns the x and y coordinates of the tile
 * @param index
 * @param mapWidth
 */
function indexToXY(index: number, mapWidth: number): ICoordinate {
  const i = { x: 0, y: 0 };

  i.x = index / mapWidth;

  i.y = Math.floor(index / mapWidth);

  return i;
}

/**
 * Coordinate to Block
 *  Returns the Field Block of the given coordinates
 *
 * @param pos
 * @returns {IBlock} Field Block
 */
function coordinateToBlock(pos: ICoordinate): IBlock {
  return PlayingField[XYToIndex(pos.x, pos.y, 12)];
}

/**
 * Index to Block
 *
 * Returns the given PlayingField block by index
 * @param index
 */
function indexToBlock(index: number): IBlock {
  return PlayingField[index];
}

/**
 * Find closest player from a given coordinate
 *
 * @param originPlayer Player that is looking for someone to pass the ball to
 * @param ref Reference position
 * @param players Players to sort through
 */
function findClosestPlayer(
  ref: ICoordinate,
  players: IFieldPlayer[],
  originPlayer?: IFieldPlayer
) {
  let plyrs = players;

  // plyrs = players.filter(p => {
  //   return !(ref.x === p.BlockPosition.x && ref.y === p.BlockPosition.y);
  // });

  plyrs.sort((a, b) => {
    return calculateDistance(ref, a.BlockPosition) <
      calculateDistance(ref, b.BlockPosition)
      ? -1
      : 1;
  });

  console.table(
    plyrs.map(p => ({
      Name: p.FirstName + ' ' + p.LastName,
      PlayerID: p.PlayerID,
      Club: p.ClubCode,
      Position: p.BlockPosition.key,
      Distance: calculateDistance(ref, p.BlockPosition),
    }))
  );

  console.log('Player =>', originPlayer ? originPlayer.PlayerID : 'nONE ');
  // console.table(
  //   plyrs.map(p => ({
  //     Name: p.FirstName + ' ' + p.LastName,
  //     PlayerID: p.PlayerID,
  //     Club: p.ClubCode,
  //     Position: p.BlockPosition.key,
  //   }))
  // );

  /**
   * The index of the origin player so we can remove it :)
   */

  if (originPlayer) {
    plyrs = plyrs.filter(p => p.PlayerID !== originPlayer.PlayerID);
  }

  // Now select a random player from the first three options

  const index = Math.round(Math.random() * 2);

  return plyrs[index];
}

/**
 * Find the closest player that is not a keeper :)
 * @param ref
 * @param players
 * @param originPlayer
 */
function findClosestFieldPlayer(
  ref: ICoordinate,
  players: IFieldPlayer[],
  originPlayer?: IFieldPlayer
) {
  // const plyrs = players;

  const plyrs = players.filter(p => {
    return p.Position !== 'GK';
  });

  plyrs.sort((a, b) => {
    return calculateDistance(ref, a.BlockPosition) <
      calculateDistance(ref, b.BlockPosition)
      ? -1
      : 1;
  });

  /**
   * The index of the origin player so we can remove it :)
   */
  if (originPlayer) {
    const psI = plyrs.findIndex(p => {
      return p === originPlayer;
    });

    plyrs.slice(psI, 1);
  }

  return plyrs[0];
}

/**
 *
 * @param ref The reference coordinate
 * @param players Array of players to sort through
 * @param originPlayer Player making the query :p
 */
function findRandomPlayer(
  ref: ICoordinate,
  players: IFieldPlayer[],
  originPlayer?: IFieldPlayer
) {
  const ps = players;

  ps.sort((a, b) => {
    return calculateDistance(ref, a.BlockPosition) <
      calculateDistance(ref, b.BlockPosition)
      ? -1
      : 1;
  });

  /**
   * The index of the origin player so we can remove it :)
   */
  const psI = ps.findIndex(p => {
    return p === originPlayer;
  });

  ps.slice(psI, 1);

  const index = Math.round(Math.random() * (players.length - 1));

  return ps[index];
}

/**
 * Find the absolute distance between two coordinates
 * less is better :)
 *
 *
 *
 * @param {ICoordinate} ref  - Coordinate you are comparing with
 * @param {ICoordinate} pos - Coordinate you are comparing with reference
 */
function calculateDistance(ref: ICoordinate, pos: ICoordinate): number {
  return Math.abs(pos.x - ref.x) + Math.abs(pos.y - ref.y);
}

/**
 * Find the coordinate you want to move to
 *
 * @param ref
 * @param pos
 */
function findPath(ref: ICoordinate, pos: ICoordinate): ICoordinate {
  const path: ICoordinate = { x: 0, y: 0 };
  const x = ref.x - pos.x;
  const y = ref.y - pos.y;

  if (x !== 0) {
    path.x = x < 0 ? -1 : 1;
  } else if (y !== 0) {
    path.y = y < 0 ? -1 : 1;
  }

  return path;
}

/**
 * Calcualte the difference between two coordinates
 * i.e from 'pos' to 'ref'
 * @param ref
 * @param pos
 */
function calculateDifference(ref: ICoordinate, pos: ICoordinate) {
  const path: ICoordinate = { x: 0, y: 0 };
  const x = ref.x - pos.x;
  const y = ref.y - pos.y;

  path.x = x;
  path.y = y;

  return path;
}

// function findAdjacentBlocks(ref: ICoordinate, pos:ICoordinate){

// }

export {
  XYToIndex,
  indexToXY,
  calculateDistance,
  findClosestPlayer,
  findClosestFieldPlayer,
  findRandomPlayer,
  findPath,
  calculateDifference,
  coordinateToBlock,
  indexToBlock,
};
