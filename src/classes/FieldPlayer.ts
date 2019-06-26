import { IFieldPlayer, IPositions } from '../interfaces/Player';
import Player from './Player';
import Ball from './Ball';
import { ICoordinate, IBlock } from './Ball';
import { coordinateToBlock } from '../utils/coordinates';
import { ballMove } from '../utils/events';

export default class FieldPlayer extends Player implements IFieldPlayer {
  public Points: number = 0;
  public Starting: boolean;
  public Substitute: boolean;
  public BlockPosition: IBlock;
  public StartingPosition: ICoordinate | null;
  public BallPosition: ICoordinate;
  public WithBall: boolean;
  public Ball: Ball;

  constructor(player: any, starting: boolean, pos: IBlock, ball: Ball) {
    super(player);
    this.Starting = starting;
    this.Ball = ball;
    this.BallPosition = this.Ball.Position;
    this.Substitute = !this.Starting;
    this.StartingPosition = pos;
    this.BlockPosition = pos;
    this.setBlockOccupant(this, this.BlockPosition);
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
    console.log(`${this.LastName} passed the ball to ${JSON.stringify(pos)}`);
  }

  public shoot() {
    this.WithBall = false;
  }

  public updateBallPosition(pos: IBlock) {
    this.Ball.Position = pos;
    this.checkWithBall();
  }

  public move(pos: ICoordinate): void {
    
    // First set occupant of current Block to null
    this.setBlockOccupant(null, this.BlockPosition);
    // Then set this players BlockPosition to his current Block coordinates

    const newPos = {x: this.BlockPosition.x += pos.x, y: this.BlockPosition.y += pos.y};

    this.BlockPosition = coordinateToBlock(newPos);

    // Then set the Block Occupant of current block to this player
    this.setBlockOccupant(this, this.BlockPosition);
    if (this.WithBall) {
      this.Ball.move(pos);
    }
    this.checkWithBall();
  }

  public substitute() {
    this.Starting = false;
  }

  public start() {
    this.Starting = true;
  }

  public checkNextBlocks() {
    const around: IPositions = {
      top: null,
      left: null,
      right: null,
      bottom: null,
    };
    around.top = coordinateToBlock({x: this.BlockPosition.x, y: this.BlockPosition.y - 1});
    around.left = coordinateToBlock({x: this.BlockPosition.x - 1, y: this.BlockPosition.y});
    around.right =coordinateToBlock({x: this.BlockPosition.x + 1, y: this.BlockPosition.y});
    around.bottom =coordinateToBlock({x: this.BlockPosition.x, y: this.BlockPosition.y + 1});

    // console.log(`Players around: `, JSON.stringify(around));
    return around;
  }

  private checkWithBall() {
    this.WithBall =
      this.BlockPosition.key === this.Ball.Position.key
        ? true
        : false;

    if (this.WithBall) {
      console.log(`${this.LastName} is now with the ball :)`);
    }
  }
  private setBlockOccupant(who: any, pos:ICoordinate) :void{
    coordinateToBlock(pos).occupant = who;
  }
}
