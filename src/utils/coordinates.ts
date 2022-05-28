/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Field, { ICoordinate, IBlock } from '../state/ImmutableState/FieldGrid';
import { IFieldPlayer } from '../interfaces/Player';
import log from '../helpers/logger';
export default class Coordinates {
  public static _co: Coordinates;
  public Field: Field;
  private PlayingField;
  private mapWidth;

  public static get co() {
    return Coordinates._co;
  }

  constructor() {
    this.Field = new Field();
    this.PlayingField = this.Field.PlayingField;
    this.mapWidth = this.Field.mapWidth;
    Coordinates._co = this;
  }

  /**
   * Returns the tile index of the given coordinates
   *
   * @param x
   * @param y
   * @param mapWidth
   *
   */
  // tslint:disable-next-line: no-shadowed-variable
  public XYToIndex(x: number, y: number, mapWidth: number): number {
    return y * mapWidth + x;
  }

  /**
   * Returns the x and y coordinates of the tile
   * @param index
   * @param mapWidth
   */
  // tslint:disable-next-line: no-shadowed-variable
  public indexToXY(index: number, mapWidth: number): ICoordinate {
    const i = { x: 0, y: 0 };

    i.x = index % mapWidth;

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
  public coordinateToBlock(pos: ICoordinate): IBlock {
    return this.PlayingField[this.XYToIndex(pos.x, pos.y, this.mapWidth)];
  }

  /**
   * Index to Block
   *
   * Returns the given PlayingField block by index
   * @param index
   */
  public indexToBlock(index: number): IBlock {
    return this.PlayingField[index];
  }

  /**
   * Find closest player from a given coordinate
   *
   * @param originPlayer Player that is looking for someone to pass the ball to
   * @param ref Reference position
   * @param players Players to sort through
   */
  public findClosestPlayer(
    ref: ICoordinate,
    players: IFieldPlayer[],
    originPlayer?: IFieldPlayer,
    closest = false,
    _position?: string
  ): IFieldPlayer {
    let plyrs = players;

    // plyrs = players.filter(p => {
    //   return !(ref.x === p.BlockPosition.x && ref.y === p.BlockPosition.y);
    // });

    plyrs = plyrs.sort((a, b) => {
      return this.calculateDistance(ref, a.BlockPosition) <
        this.calculateDistance(ref, b.BlockPosition)
        ? -1
        : 1;
    });

    log(
      plyrs.map((p) => ({
        Name: p.FirstName + ' ' + p.LastName,
        PlayerPosition: p.Position,
        Club: p.ClubCode,
        Position: p.BlockPosition.key,
        Distance: this.calculateDistance(ref, p.BlockPosition),
      })),
      'table'
    );

    /**
     * The index of the origin player so we can remove it :)
     */

    if (originPlayer) {
      plyrs = plyrs.filter((p) => p._id !== originPlayer._id);
    }

    // Now select a random player from the first three options

    const index = closest ? 0 : Math.round(Math.random() * 2);

    return plyrs[index];
  }

  /**
   * Find the closest player to something, including the current player
   * @param ref
   * @param players
   * @param _originPlayer
   */
  public findClosestPlayerInclusive(
    ref: ICoordinate,
    players: IFieldPlayer[],
    _originPlayer?: IFieldPlayer
  ) {
    let plyrs = players;

    // plyrs = players.filter(p => {
    //   return !(ref.x === p.BlockPosition.x && ref.y === p.BlockPosition.y);
    // });

    plyrs = plyrs.sort((a, b) => {
      return this.calculateDistance(ref, a.BlockPosition) <
        this.calculateDistance(ref, b.BlockPosition)
        ? -1
        : 1;
    });

    // Now select a random player from the first three options
    return plyrs[0];
  }

  /**
   * Find the closest player that is not a keeper :)
   * @param ref
   * @param players
   * @param originPlayer
   */
  public findClosestFieldPlayer(
    ref: ICoordinate,
    players: IFieldPlayer[],
    originPlayer?: IFieldPlayer,
    limit?: number
  ) {
    // const plyrs = players;
    // Remove Golakeepers
    let plyrs: IFieldPlayer[] = players.filter((p) => {
      return p.Position !== 'GK';
    });

    // Sort by distance
    plyrs = plyrs.sort((a, b) => {
      return this.calculateDistance(ref, a.BlockPosition) <
        this.calculateDistance(ref, b.BlockPosition)
        ? -1
        : 1;
    });

    /**
     * The index of the origin player so we can remove it :)
     */
    if (originPlayer) {
      const psI = plyrs.findIndex((p) => {
        return p === originPlayer;
      });

      plyrs.slice(psI, 1);
    }

    if (limit) {
      plyrs = plyrs.filter((a) => {
        return this.calculateDistance(ref, a.BlockPosition) <= limit;
      });
    }

    return plyrs[0];
  }

  /**
   *
   * @param ref The reference coordinate
   * @param players Array of players to sort through
   * @param originPlayer Player making the query :p
   */
  public findRandomPlayer(
    ref: ICoordinate,
    players: IFieldPlayer[],
    originPlayer?: IFieldPlayer
  ) {
    const ps = players;

    ps.sort((a, b) => {
      return this.calculateDistance(ref, a.BlockPosition) <
        this.calculateDistance(ref, b.BlockPosition)
        ? -1
        : 1;
    });

    /**
     * The index of the origin player so we can remove it :)
     */
    const psI = ps.findIndex((p) => {
      return p === originPlayer;
    });

    ps.slice(psI, 1);

    const index = Math.round(Math.random() * (players.length - 1));

    return ps[index];
  }

  public findClosestPlayerByPosition(
    ref: ICoordinate,
    position: string,
    originPlayer: IFieldPlayer,
    players: IFieldPlayer[]
  ) {
    // const plyrs = players;
    // Remove Golakeepers
    let plyrs: IFieldPlayer[] = players.filter((p) => {
      return p.Position === position;
    });

    // Sort by distance
    plyrs = plyrs.sort((a, b) => {
      return this.calculateDistance(ref, a.BlockPosition) <
        this.calculateDistance(ref, b.BlockPosition)
        ? -1
        : 1;
    });

    /**
     * The index of the origin player so we can remove it :)
     */
    const psI = plyrs.findIndex((p) => {
      return p === originPlayer;
    });

    plyrs.slice(psI, 1);

    return plyrs[0];
  }

  public findLongPlayer(
    ref: ICoordinate,
    players: IFieldPlayer[],
    _originPlayer?: IFieldPlayer
  ) {
    let plyrs = players;

    // Find players that are 5 blocks or more away
    plyrs = plyrs.filter((a, _b) => {
      return this.calculateDistance(ref, a.BlockPosition) >= 5;
    });

    /**
     * The index of the origin player so we can remove it :)
     */

    const index = Math.round(Math.random() * (plyrs.length - 1));

    return plyrs[index];
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
  public calculateDistance(ref: ICoordinate, pos: ICoordinate): number {
    return Math.abs(pos.x - ref.x) + Math.abs(pos.y - ref.y);
  }

  /**
   * Find the coordinate you want to move to
   *
   * @param ref
   * @param pos
   */
  public findPath(ref: ICoordinate, pos: ICoordinate): ICoordinate {
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
   * i.e from 'pos' to 'dest'
   * @param ref the destination i.e tackler
   * @param pos the current location i.e tackled
   */
  public calculateDifference(dest: ICoordinate, pos: ICoordinate) {
    const path: ICoordinate = { x: 0, y: 0 };

    log(`Dest => ${JSON.stringify({ x: dest.x, y: dest.y })}`);
    log(`Pos => ${JSON.stringify({ x: pos.x, y: pos.y })}`);

    let x = dest.x - pos.x;
    let y = dest.y - pos.y;

    // if x is -ve
    if (x < 0 && pos.x === 0) {
      x = Math.abs(x);
    }

    // If y is -ve
    if (y < 0 && pos.y === 0) {
      y = Math.abs(y);
    }

    // These checks prevent sending

    path.x = x;
    path.y = y;

    return path;
  }

  public atExtremeBlock(pos: ICoordinate) {
    return pos.x === 0 || pos.x === 14 || pos.y === 0 || pos.y === 10;
  }

public getBlocksAround(Block: IBlock, radius: number): any[] {
    // Get the blocks around for each side.
    const blocks: any[] = [];
    for (let side = 1; side <= 4; side++) {
      // const block = this.BlockPosition.y - 1 < 0 ? undefined : coordinateToBlock({
      //   x: this.BlockPosition.x,
      //   y: this.BlockPosition.y - 1,
      // });
      switch (side) {
        case 1:
          // Top side
          for (let r = 1; r <= radius; r++) {
            const block =
              Block.y - r < 0
                ? undefined
                : this.coordinateToBlock({
                    x: Block.x,
                    y: Block.y - r,
                  });
            blocks.push(block);
          }
          break;

        case 2:
          // Left side
          for (let r = 1; r <= radius; r++) {
            const block =
              Block.x - r < 0
                ? undefined
                : this.coordinateToBlock({
                    x: Block.x - r,
                    y: Block.y,
                  });
            blocks.push(block);
          }
          break;
        case 3:
          // Right side
          for (let r = 1; r <= radius; r++) {
            const block =
              Block.x + r > 14
                ? undefined
                : this.coordinateToBlock({
                    x: Block.x + r,
                    y: Block.y,
                  });
            blocks.push(block);
          }
          break;
        case 4:
          // Bottom side
          for (let r = 1; r <= radius; r++) {
            const block =
              Block.y + r > 10
                ? undefined
                : this.coordinateToBlock({
                    x: Block.x,
                    y: Block.y + r,
                  });
            blocks.push(block);
          }
          break;

        default:
          break;
      }
    }
    return blocks;
  }
}
