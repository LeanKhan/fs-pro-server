export default class Block {
  public x: number;
  public y: number;
  public key: string;
  public occupant: IFieldPlayer | null;
  public isFlank: boolean;
  public isEnds: boolean;
  public Field: Field;

  /**
   * Create a new Playing Field
   *
   * @param xBlocks default is 15
   * @param yBlocks default is 11
   */
  constructor(
  	  x: number,
          y: number,
          key: string,
          field: Field,
          isFlank: boolean,
          isEnds: boolean,
          occupant?: IFieldPlayer,
  	) {
    this.x = x;
    this.y = y;
    this.key = key;
    this.isFlank = isFlank;
    this.isEnds = isEnds;
    this.Field = field;
    this.occupant = occupant;

  };

   public getBlocksAround(radius: number): any[] {
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
              this.BlockPosition.y - r < 0
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x,
                    y: this.BlockPosition.y - r,
                  });
            blocks.push(block);
          }
          break;

        case 2:
          // Left side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.x - r < 0
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x - r,
                    y: this.BlockPosition.y,
                  });
            blocks.push(block);
          }
          break;
        case 3:
          // Right side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.x + r > 14
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x + r,
                    y: this.BlockPosition.y,
                  });
            blocks.push(block);
          }
          break;
        case 4:
          // Bottom side
          for (let r = 1; r <= radius; r++) {
            const block =
              this.BlockPosition.y + r > 10
                ? undefined
                : CO.co.coordinateToBlock({
                    x: this.BlockPosition.x,
                    y: this.BlockPosition.y + r,
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

};


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