import { IFieldPlayer } from '../interfaces/Player';
import { ballMove } from '../utils/events';
import { XYToIndex } from '../utils/coordinates';
// import { EventEmitter } from 'events';

export default class Ball {
  public Color: string;
  public Position: IBlock;
  // private Observers: IFieldPlayer[] = [];
  private ballMove = ballMove;

  constructor(color: string, pos: IBlock) {
    this.Color = color;
    this.Position = pos;
  }

  public move(pos: ICoordinate) {
    this.Position.x += pos.x;
    this.Position.y += pos.y;
    this.Position.key = 'P' + XYToIndex(this.Position.x, this.Position.y, 12);
    // this.notifyObservers();
    this.ballMove.emit('ball-moved', this.Position);
  }

  // public attachObserver(obs: IFieldPlayer) {
  //   this.Observers.push(obs);
  // }

  // public detachObserver(obs: IFieldPlayer) {
  //   const pId = this.Observers.findIndex((v: any) => {
  //     return v.Player_ID === obs.PlayerID;
  //   });
  //   this.Observers.splice(pId);
  // }

  // public notifyObservers() {
  //   this.Observers.forEach(plyr => {
  //     plyr.updateBallPosition(this.Position);
  //   });
  // }
}

export interface ICoordinate {
  x: number;
  y: number;
}

export interface IBlock extends ICoordinate {
  key: string;
}
