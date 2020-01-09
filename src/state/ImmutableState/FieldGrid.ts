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
  constructor(xBlocks: number = 15, yBlocks: number = 11) {
    this.PlayingField = this.createGrid(xBlocks, yBlocks);
    this.mapWidth = xBlocks;
    this.mapHeight = yBlocks;
  }

  /**
   * Creates a playing field with all the things...
   * @param xBlocks The number on the x-axis
   * @param yBlocks The number on the y-axis
   */
  private createGrid = (xBlocks: number, yBlocks: number) => {
    let blockNumber = 0;
    const blocks: IBlock[] = [];
    for (let y = 0; y < yBlocks; y++) {
      for (let x = 0; x < xBlocks; x++) {
        blocks.push({
          x,
          y,
          occupant: null,
          key: `P${blockNumber}`,
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
}