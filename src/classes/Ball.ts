import { ballMove } from '../utils/events';
import { coordinateToBlock } from '../utils/coordinates';
import { IBlock, ICoordinate } from '../state/ImmutableState/FieldGrid';
// import { EventEmitter } from 'events';

export default class Ball implements IBall {
  public Color: string;
  public Position: IBlock;
  // private Observers: IFieldPlayer[] = [];
  private ballMove = ballMove;

  constructor(color: string, pos: IBlock) {
    this.Color = color;
    this.Position = pos;
  }

  public move(pos: ICoordinate) {
    console.log(
      `oldPos ${JSON.stringify({ x: this.Position.x, y: this.Position.y })}`
    );

    console.log(`sent pos ${JSON.stringify({ x: pos.x, y: pos.y })}`);

    const newPos = { x: this.Position.x + pos.x, y: this.Position.y + pos.y };

    console.log(`newPos ${JSON.stringify(newPos)}`);

    // this.Position.x += pos.x;
    // this.Position.y += pos.y;
    // this.Position.key = 'P' + XYToIndex(this.Position.x, this.Position.y, 12);

    this.Position = coordinateToBlock(newPos);

    console.log(
      `New Ball position ${JSON.stringify({
        x: this.Position.x,
        y: this.Position.y,
        key: this.Position.key,
      })}`
    ); 

    // this.notifyObservers();
    this.ballMove.emit('ball-moved', this.Position);
  }
}

export interface IBall {
  Color: string;
  Position: IBlock;
  move(pos: ICoordinate): void;
}
