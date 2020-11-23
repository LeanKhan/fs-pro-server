import { ballMove } from '../utils/events';
import { coordinateToBlock } from '../utils/coordinates';
import { IBlock, ICoordinate } from '../state/ImmutableState/FieldGrid';
// import { EventEmitter } from 'events';

// TODO: [[ Problem 2 ]]
// Make this Class keep track of Balls created

class BallClass {
  public static instances: number;
  // new (): IBall;
}
// tslint:disable-next-line: max-classes-per-file
export default class Ball implements IBall, BallClass {
  public get created(): Date {
    return this._created;
  }
  public static instances: number = 0;
  public Color: string;
  public Position: IBlock;
  // private Observers: IFieldPlayer[] = [];
  private ballMove = ballMove;
  private readonly _created: Date;

  constructor(color: string, pos: IBlock) {
    this.Color = color;
    this.Position = pos;
    this._created = new Date();
    Ball.instances++;
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

// TODO: [-[ PROBLEM 1 ]-]
/***
 * State the problem
 * Eldoosh Mahd [with Ball? false] at {"x":5,"y":0,"key":"P5"} tackled the ball from El Jin Jahat [with Ball? false] who was at {"x":5,"y":1,"key":"P20"} at 72 mins [19-nov-20]
 * 
 * After having played a match, when a plyr tries to tackle the ball from another, I notice that neither of them have the ball!
 * So strange...
 * 
 * ---- evidence 2
 * Ball x,y =>  5 1
  Tackler P000152 Mahd Ball x,y => 2 3 P47
  Player P000153 Jahat Ball x,y => 5 1 P20
  Ref =>  {"x":5,"y":0}
  Pos =>  {"x":5,"y":1}
  oldPos {"x":2,"y":3}
  sent pos {"x":0,"y":-1}
  newPos {"x":2,"y":2}
  New Ball position {"x":2,"y":2,"key":"P32"}
  New Position x,y,key => 2 2 P32
  ----
  This is what happens, the ball is meant to move from the original holder to the tackler (if successful, and this tackle was)
  but now we are seeing that the ball is at two different locations! {2,3} and {5,1}. How?
 */

export interface IBall {
  Color: string;
  Position: IBlock;
  created: Date;
  move(pos: ICoordinate): void;
}
