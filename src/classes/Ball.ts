import { IFieldPlayer } from '../interfaces/Player';
import { ballMove } from '../utils/events';
import { XYToIndex, coordinateToBlock } from '../utils/coordinates';
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

    const newPos = {x: this.Position.x += pos.x, y: this.Position.y += pos.y};

    // this.Position.x += pos.x;
    // this.Position.y += pos.y;
    // this.Position.key = 'P' + XYToIndex(this.Position.x, this.Position.y, 12);

    this.Position = coordinateToBlock(newPos);

    // this.notifyObservers();
    this.ballMove.emit('ball-moved', this.Position);
  }
}

export interface ICoordinate {
  x: number;
  y: number;
}

export interface IBlock extends ICoordinate {
  key: string;
  occupant: IFieldPlayer | null;
}

export interface IBall {
  Color: string,
  Position: IBlock,
  move(pos:ICoordinate): void
}