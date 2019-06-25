import { IFieldPlayer } from '../interfaces/Player';
import Player from './Player';
import Ball from './Ball';
import { ICoordinate, IBlock } from './Ball';
import { XYToIndex, indexToXY } from '../utils/coordinates';
import { ballMove } from '../utils/events';

export default class FieldPlayer extends Player implements IFieldPlayer {
  public Points: number = 0;
  public Starting: boolean;
  public Substitute: boolean;
  public BlockPosition: IBlock;
  public StartingPosition: ICoordinate | null;
  public BallPosition: ICoordinate;
  public WithBall: boolean;
  private Ball: Ball;

  constructor(player: any, starting: boolean, pos: IBlock, ball: Ball) {
    super(player);
    this.Starting = starting;
    this.Ball = ball;
    this.BallPosition = this.Ball.Position;
    this.Substitute = !this.Starting;
    this.StartingPosition = pos;
    this.BlockPosition = pos;
    this.WithBall =
      this.BlockPosition.x === this.BallPosition.x &&
      this.BlockPosition.y === this.BallPosition.y
        ? true
        : false;
    ballMove.on('ball-moved', p => {
      this.updateBallPosition(p);
    });
  }

  public pass(pos: ICoordinate) {
    this.Ball.move(pos);
    this.WithBall = false;
  }

  public shoot() {
    this.WithBall = false;
  }

  public updateBallPosition(pos: IBlock) {
    this.Ball.Position = pos;
  }

  public move(pos: ICoordinate): void {
    this.BlockPosition.x += pos.x;
    this.BlockPosition.y += pos.y;
    this.BlockPosition.key =
      'P' + XYToIndex(this.BlockPosition.x, this.BlockPosition.y, 12);
    if (this.WithBall) {
      this.Ball.move(pos);
    }
    this.WithBall =
      this.BlockPosition.x === this.BallPosition.x &&
      this.BlockPosition.y === this.BallPosition.y
        ? true
        : false;
    console.log(
      `${this.FirstName} ${this.LastName} [${
        this.ClubCode
      }] moved here ${JSON.stringify(this.BlockPosition)}`
    );
  }

  public substitute() {
    this.Starting = false;
  }

  public start() {
    this.Starting = true;
  }
}
