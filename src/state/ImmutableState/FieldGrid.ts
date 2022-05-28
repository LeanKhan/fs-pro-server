import { IFieldPlayer } from '../../interfaces/Player';

export default class Field {
  public PlayingField: IBlock[];
  public mapWidth: number;
  public mapHeight: number;

  /**
   * Create a new Playing Field
   *
   * @param xBlocks default is 15
   * @param yBlocks default is 11
   */
  constructor(xBlocks = 15, yBlocks = 11) {
    this.PlayingField = this.createGrid(xBlocks, yBlocks);
    this.mapWidth = xBlocks;
    this.mapHeight = yBlocks;
  }

  /** Check if this block is at the flanks (sides) of the field */
  public checkIfFlank(x: number, y: number, xBlocks: number, yBlocks: number) {
    return y == yBlocks - 1 || y == 0;
  }

  /** Check if this block is at the Head or Tail of the Field */
  public checkIfEnds(x: number, y: number, xBlocks: number, yBlocks: number) {
    return x == xBlocks - 1 || x == 0;
  }

  /**
   * Creates a playing field with all the things...
   * @param xBlocks The number on the x-axis
   * @param yBlocks The number on the y-axis
   */
  private createGrid = (xBlocks: number, yBlocks: number) => {
    let blockNumber = 0;
    // make Block a class...
    const blocks: IBlock[] = [];
    for (let y = 0; y < yBlocks; y++) {
      for (let x = 0; x < xBlocks; x++) {
        blocks.push({
          x,
          y,
          occupant: null,
          key: `P${blockNumber}`,
          isFlank: this.checkIfFlank(x, y, xBlocks, yBlocks),
          isEnds: this.checkIfEnds(x, y, xBlocks, yBlocks),
          Field: this
        });
        // After each push increment the counter
        blockNumber++;
      }
    }

    return blocks;
  };
}

export interface ICoordinate {
  x: number;
  y: number;
}

export interface IBlock extends ICoordinate {
  key: string;
  occupant: IFieldPlayer | null;
  isFlank: boolean;
  isEnds: boolean;
  Field: Field;
}
