import { ICoordinate, IBlock } from '../classes/Ball';
import { IFieldPlayer } from '../interfaces/Player';
import { PlayingField } from '../GameState/ImmutableState/FieldGrid';

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
 * Find closest player
 * @param ref
 * @param players
 */
function findClosestPlayer(
  ref: ICoordinate,
  players: IFieldPlayer[],
  distance: string
) {
  const plyrs = players;
  let index = 0;

  switch (distance) {
    case 'closest':
      index = 0;
      break;
    case 'random':
      index = Math.round(Math.random() * (players.length - 6));
      break;
  }

  plyrs.sort((a, b) => {
    return calculateDistance(ref, a.BlockPosition) <
      calculateDistance(ref, b.BlockPosition)
      ? -1
      : 1;
  });

  if (calculateDistance(ref, plyrs[index].BlockPosition) === 0) {
    return plyrs[index + 1];
  } else {
    return plyrs[index];
  }
}
/**
 * Find the absolute distance between two coordinates
 * less is better :)
 *
 * @param {ICoordinate} ref  - Coordinate you are comparing with
 * @param {ICoordinate} pos - Coordinate you are comparing with reference
 */

/**
 * Calculate absolute distance between two coordinates
 *
 * @param ref
 * @param pos
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
 *
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
  findPath,
  calculateDifference,
  coordinateToBlock,
  indexToBlock,
};
