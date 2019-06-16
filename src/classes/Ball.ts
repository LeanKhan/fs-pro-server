import { IFieldPlayer } from '../interfaces/Player';

export default class Ball {
  public Color: string;
  public Position: ICoordinate;
  private Observers: IFieldPlayer[] = [];

  constructor(color: string, pos: ICoordinate) {
    this.Color = color;
    this.Position = pos;
  }

  public move(pos: ICoordinate) {
    this.Position.x += pos.x;
    this.Position.y += pos.y;
    this.notifyObservers();
  }

  private attachObserver(obs: IFieldPlayer) {
    this.Observers.push(obs);
  }

  private detachObserver(obs: IFieldPlayer) {
    const pId = this.Observers.findIndex((v: any) => {
      return v.Player_ID === obs.PlayerID;
    });
    this.Observers.splice(pId);
  }

  private notifyObservers() {
    this.Observers.forEach(plyr => {
      plyr.updateBallPosition(this.Position);
    });
  }
}

export interface ICoordinate {
  x: number;
  y: number;
}

export interface IBlock extends ICoordinate {
  key: string;
}
