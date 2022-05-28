import { ballMove, matchEvents } from '../utils/events';
import CO from '../utils/coordinates';
import { IBlock, ICoordinate } from '../state/ImmutableState/FieldGrid';
import log from '../helpers/logger';
import { generateRandomNDigits } from '../helpers/misc';

class BallClass {
  public static instances: number;
}
// tslint:disable-next-line: max-classes-per-file
export default class Ball implements IBall, BallClass {
  public get created(): Date {
    return this._created;
  }
  public static instances = 0;
  public Color: string;
  public Position: IBlock;
  public id: string;
  public Match_id: string;
  // private Observers: IFieldPlayer[] = [];
  private ballMove = ballMove;
  private readonly _created: Date;

  constructor(color: string, pos: IBlock, match_id: string) {
    this.Color = color;
    this.Position = pos;
    this._created = new Date();
    this.id = '' + generateRandomNDigits(5);
    this.Match_id = match_id;
    Ball.instances++;
  }

  public move(pos: ICoordinate) {
    // console.log('Position => ', this.Position, 'pos => ', pos);
    log(`old Coordinates ${JSON.stringify({ x: this.Position.x, y: this.Position.y })}`);

    log(`sent coordinates ${JSON.stringify({ x: pos.x, y: pos.y })}`);

    const newCoordinates = { x: this.Position.x + pos.x, y: this.Position.y + pos.y };

    // this.Position.x += pos.x;
    // this.Position.y += pos.y;
    // this.Position.key = 'P' + XYToIndex(this.Position.x, this.Position.y, 12);

    let newPosition = CO.co.coordinateToBlock(newCoordinates);
    // if Position is undefined, the Block does not exist.
    // i.e the ball is out!

    if (!newPosition) {
      // meaning this ball would have gone out by the flanks
      // e.g original position is 8, 5 and the movement coords is 0, -6
      // the new position would be 8, -1 which is out.
      const isGoingOutAtFlanks = this.Position.y + pos.y < 0 || this.Position.y + pos.y > this.Position.Field.mapHeigth - 1;
      const isGoingOutAtEnds = this.Position.x + pos.x < 0 || this.Position.x + pos.x > this.Position.Field.mapWidth - 1;

    matchEvents.emit(`${this.Match_id}-ball-out`, {
        where: this.Position,
        towards: isGoingOutAtEnds ? 'ends' : isGoingOutAtFlanks ? 'flanks' : 'idk'
      });
    } else {
      this.Position = newPosition;
    }

    log(
      `New Ball position ${JSON.stringify({
        x: this.Position.x,
        y: this.Position.y,
        key: this.Position.key,
      })}`
    );

    // this.notifyObservers();
    this.ballMove.emit(`${this.id}-ball-moved`, this.Position);
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

//  UPDATE: I believe this has been fixed! Thank you Jesus!

export interface IBall {
  Color: string;
  Position: IBlock;
  created: Date;
  // unique ball id
  id: string;
  move(pos: ICoordinate): void;
}
